import { Inject, Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { REFERRALS, type ReferralsRepository } from "./referrals.repository";
import type { ReferralCodeInput } from "../domain/referral";
import { UsersService } from "../../users/application/users.service";
import { StoresService } from "../../stores/application/stores.service";
import { CouponsService } from "../../coupons/application/coupons.service";
import { FinanceService } from "../../finance/application/finance.service";
import { commission } from "../../finance/domain/finance";
import { AuditService } from "../../audit/application/audit.service";
import {
  TRANSACTIONS,
  type TransactionRunner,
} from "../../../shared/transactions";
import { conflict, notFound } from "../../../shared/errors";
import type { PageQuery } from "../../../shared/page";
@Injectable()
export class ReferralsService {
  constructor(
    @Inject(REFERRALS) private readonly repository: ReferralsRepository,
    private readonly users: UsersService,
    private readonly stores: StoresService,
    private readonly coupons: CouponsService,
    private readonly finance: FinanceService,
    private readonly audit: AuditService,
    @Inject(TRANSACTIONS) private readonly tx: TransactionRunner,
  ) {}
  private valid(code: { active: boolean; startsOn: string; endsOn: string }) {
    const today = new Date().toISOString().slice(0, 10);
    return code.active && code.startsOn <= today && code.endsOn >= today;
  }
  async resolve(text: string) {
    const code = await this.repository.byCode(text);
    if (!code || !this.valid(code)) throw notFound();
    return {
      code: code.code,
      title: code.title,
      kind: code.kind,
      discountBps: code.discountBps,
      discountStoreId: code.discountStoreId,
    };
  }
  async create(id: string, actorId: string, input: ReferralCodeInput) {
    return this.tx.run(async () => {
      const old = await this.repository.code(id);
      if (old) {
        if (JSON.stringify(old.initialInput) !== JSON.stringify(input))
          throw conflict();
        return old;
      }
      const owner = await this.users.findById(input.ownerId);
      if (!owner || owner.accountControl?.status === "paused") throw notFound();
      const couponId = input.discountBps ? (await this.discount(input)).id : "",
        code = {
          ...input,
          id,
          initialInput: input,
          couponId,
          version: 0,
          createdAt: new Date(),
        };
      await this.repository.createCode(code);
      await this.audit.append(actorId, "platform", "referral.code-create", id);
      return code;
    });
  }
  async update(
    id: string,
    actorId: string,
    version: number,
    input: ReferralCodeInput,
  ) {
    return this.tx.run(async () => {
      const code = await this.repository.code(id);
      if (!code) throw notFound();
      if (
        code.ownerId !== input.ownerId ||
        code.code !== input.code ||
        code.kind !== input.kind ||
        code.discountStoreId !== input.discountStoreId
      )
        throw conflict(
          "Kodun kimliği ve indirim mağazası değiştirilemez; yeni kod oluşturun.",
        );
      if (code.couponId && !input.discountBps)
        throw conflict("Kuponlu kodu sıfırlamak yerine pasif yapın.");
      let couponId = code.couponId;
      if (input.discountBps) {
        const current = code.couponId
          ? await this.coupons.byId(input.discountStoreId, code.couponId)
          : undefined;
        couponId = (await this.discount(input, current?.id, current?.version))
          .id;
      }
      const saved = await this.repository.saveCode(
        { ...code, ...input, couponId },
        version,
      );
      if (!saved) throw conflict();
      await this.audit.append(actorId, "platform", "referral.code-update", id);
      return saved;
    });
  }
  private async discount(
    input: ReferralCodeInput,
    id?: string,
    version?: number,
  ) {
    await this.stores.byId(input.discountStoreId);
    return this.coupons.save(
      input.discountStoreId,
      {
        code: input.code,
        kind: "basis-points",
        amount: input.discountBps,
        minimumCents: 0,
        limitUses: input.discountUses,
        startsAt: new Date(input.startsOn + "T00:00:00.000Z"),
        expiresAt: new Date(
          new Date(input.endsOn + "T00:00:00.000Z").getTime() + 86400000,
        ),
        active: input.active,
        reusableAfterRefund: false,
      },
      id,
      version,
    );
  }
  async attribute(userId: string, email: string, text: string) {
    const code = await this.repository.byCode(text);
    if (!code || !this.valid(code))
      throw conflict("Referans kodu geçersiz veya süresi dolmuş.");
    const owner = await this.users.findById(code.ownerId);
    if (
      !owner ||
      owner.email === email ||
      owner.accountControl?.status === "paused"
    )
      throw conflict("Kendi hesabınıza veya kapalı hesaba referans verilemez.");
    if (code.kind === "campaign") return;
    const old = await this.repository.conversionByCustomer(userId);
    if (old) {
      if (old.codeId !== code.id) throw conflict();
      return;
    }
    await this.repository.createConversion({
      id: randomUUID(),
      codeId: code.id,
      ownerId: code.ownerId,
      customerId: userId,
      rewardBps: code.rewardBps,
      qualification: code.qualification,
      status: "registered",
      sourceId: "",
      commissionBaseCents: 0,
      rewardCents: 0,
      version: 0,
      createdAt: new Date(),
    });
  }
  async settled(
    ownerId: string,
    order: { id: string; totalCents: number; commissionBasisPoints?: number },
  ) {
    const conversion = await this.repository.conversionByCustomer(ownerId);
    if (!conversion || conversion.status !== "registered") return;
    const base = commission(order.totalCents, order.commissionBasisPoints ?? 0),
      rewardCents = commission(base, conversion.rewardBps);
    await this.finance.referralReward(
      conversion.ownerId,
      order.id,
      rewardCents,
      false,
    );
    if (
      !(await this.repository.saveConversion(
        {
          ...conversion,
          status: "qualified",
          sourceId: order.id,
          commissionBaseCents: base,
          rewardCents,
        },
        conversion.version,
      ))
    )
      throw conflict();
    await this.audit.append(
      "system",
      "platform",
      "referral.qualified",
      conversion.id,
    );
  }
  async refund(orderId: string) {
    const conversion = await this.repository.conversionBySource(orderId);
    if (!conversion || conversion.status !== "qualified") return;
    await this.finance.referralReward(
      conversion.ownerId,
      orderId,
      conversion.rewardCents,
      true,
    );
    if (
      !(await this.repository.saveConversion(
        { ...conversion, status: "rejected" },
        conversion.version,
      ))
    )
      throw conflict();
  }
  codes(query: PageQuery, ownerId?: string) {
    return this.repository.codes(query, ownerId);
  }
  conversions(query: PageQuery, ownerId?: string) {
    return this.repository.conversions(query, ownerId);
  }
}
