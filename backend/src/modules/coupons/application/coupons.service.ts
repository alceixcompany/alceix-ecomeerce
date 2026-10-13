import { Inject, Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { COUPONS, type CouponsRepository } from "./coupons.repository";
import type { Coupon } from "../domain/coupon";
import {
  TRANSACTIONS,
  type TransactionRunner,
} from "../../../shared/transactions";
import { conflict, notFound } from "../../../shared/errors";
import type { PageQuery } from "../../../shared/page";
@Injectable()
export class CouponsService {
  constructor(
    @Inject(COUPONS) private readonly repository: CouponsRepository,
    @Inject(TRANSACTIONS) private readonly tx: TransactionRunner,
  ) {}
  list(storeId: string, query: PageQuery) {
    return this.repository.list(storeId, query);
  }
  async save(
    storeId: string,
    input: Omit<Coupon, "id" | "storeId" | "used" | "version" | "createdAt">,
    id?: string,
    version?: number,
  ) {
    return this.tx.run(async () => {
      const old = id ? await this.repository.get(id) : null;
      if (id && (!old || old.storeId !== storeId)) throw notFound();
      if (old && input.limitUses < old.used)
        throw conflict("Kullanım sınırı mevcut kullanımlardan küçük olamaz.");
      const coupon = {
        ...input,
        id: id ?? randomUUID(),
        storeId,
        used: old?.used ?? 0,
        version: old?.version ?? 0,
        createdAt: old?.createdAt ?? new Date(),
      };
      if (old) {
        const saved = await this.repository.save(coupon, version!);
        if (!saved) throw conflict();
        return saved;
      }
      await this.repository.create(coupon);
      return coupon;
    });
  }
  async claim(
    storeId: string,
    orderId: string,
    buyerId: string,
    code: string,
    subtotal: number,
  ) {
    const old = await this.repository.redemption(orderId);
    if (old) {
      const coupon = await this.repository.get(old.couponId);
      if (
        coupon?.storeId !== storeId ||
        coupon.code !== code ||
        old.buyerId !== buyerId ||
        old.status !== "held"
      )
        throw conflict();
      return old.discountCents;
    }
    const coupon = await this.repository.byCode(storeId, code);
    if (
      !coupon ||
      !coupon.active ||
      (coupon.startsAt && coupon.startsAt.getTime() > Date.now()) ||
      coupon.expiresAt.getTime() <= Date.now() ||
      coupon.used >= coupon.limitUses ||
      subtotal < coupon.minimumCents ||
      !buyerId ||
      (coupon.allowedBuyerId && coupon.allowedBuyerId !== buyerId) ||
      (await this.repository.buyerRedemption(coupon.id, buyerId))
    )
      throw conflict(
        "Kupon geçersiz, kullanılmış veya sepet için uygun değil.",
      );
    const discountCents =
      coupon.kind !== "fixed"
        ? Number(
            (BigInt(subtotal) * BigInt(coupon.amount)) /
              (coupon.kind === "basis-points" ? 10000n : 100n),
          )
        : coupon.amount;
    if (discountCents >= subtotal)
      throw conflict("Kupon indirimi ürün toplamından küçük olmalı.");
    if (
      !(await this.repository.save(
        { ...coupon, used: coupon.used + 1 },
        coupon.version,
      ))
    )
      throw conflict();
    await this.repository.createRedemption({
      orderId,
      couponId: coupon.id,
      buyerId,
      discountCents,
      status: "held",
    });
    return discountCents;
  }
  async consume(orderId: string) {
    const redemption = await this.repository.redemption(orderId);
    if (
      redemption?.status === "held" &&
      !(await this.repository.saveRedemption(
        { ...redemption, status: "consumed" },
        "held",
      ))
    )
      throw conflict();
  }
  async release(orderId: string, refund = false) {
    const redemption = await this.repository.redemption(orderId);
    if (!redemption || !["held", "consumed"].includes(redemption.status))
      return;
    const coupon = await this.repository.get(redemption.couponId);
    if (!coupon) throw conflict();
    const reusable = !refund || coupon.reusableAfterRefund;
    if (
      reusable &&
      !(await this.repository.save(
        { ...coupon, used: coupon.used - 1 },
        coupon.version,
      ))
    )
      throw conflict();
    if (
      !(await this.repository.saveRedemption(
        { ...redemption, status: reusable ? "released" : "refunded" },
        redemption.status,
      ))
    )
      throw conflict();
  }
  async byId(storeId: string, id: string) {
    const coupon = await this.repository.get(id);
    if (!coupon || coupon.storeId !== storeId) throw notFound();
    return coupon;
  }
}
