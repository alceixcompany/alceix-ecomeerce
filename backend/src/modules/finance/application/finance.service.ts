import { UsersService } from "../../users/application/users.service";
import { CONFIG, type AppConfig } from "../../../config/config";
import { Inject, Injectable } from "@nestjs/common";
import { createHash, randomUUID } from "node:crypto";
import { FINANCE, type FinanceRepository } from "./finance.repository";
import {
  commission,
  type CommercePolicy,
  type Posting,
  type Withdrawal,
} from "../domain/finance";
import { JobsService } from "../../jobs/application/jobs.service";
import { IntegrationsService } from "../../integrations/application/integrations.service";
import { AuditService } from "../../audit/application/audit.service";
import {
  TRANSACTIONS,
  type TransactionRunner,
} from "../../../shared/transactions";
import { conflict, notFound, unavailable } from "../../../shared/errors";
import type { PageQuery } from "../../../shared/page";
@Injectable()
export class FinanceService {
  constructor(
    @Inject(FINANCE) private readonly repository: FinanceRepository,
    private readonly jobs: JobsService,
    private readonly users: UsersService,
    @Inject(CONFIG) private readonly config: AppConfig,
    private readonly integrations: IntegrationsService,
    private readonly audit: AuditService,
    @Inject(TRANSACTIONS) private readonly tx: TransactionRunner,
  ) {}
  async policy(scopeId: string): Promise<CommercePolicy> {
    return (
      (await this.repository.policy(scopeId)) ?? {
        scopeId,
        commissionBasisPoints: null,
        returnDays: null,
        shippingMode: "unconfigured",
        fixedShippingCents: 0,
        version: 0,
      }
    );
  }
  async configure(
    scopeId: string,
    version: number,
    input: Omit<CommercePolicy, "scopeId" | "version">,
    actorId: string,
  ) {
    return this.tx.run(async () => {
      const saved = await this.repository.savePolicy(
        { scopeId, ...input, version },
        version,
      );
      if (!saved) throw conflict();
      await this.audit.append(actorId, scopeId, "commerce.policy", scopeId);
      return saved;
    });
  }
  async requiredPolicy(scopeId: string) {
    const policy = await this.policy(scopeId);
    if (
      policy.commissionBasisPoints === null ||
      policy.returnDays === null ||
      policy.shippingMode === "unconfigured"
    )
      throw unavailable("Komisyon, iade ve teslimat politikası tamamlanmalı.");
    return policy;
  }
  async post(
    scopeId: string,
    referenceId: string,
    kind: string,
    postings: Posting[],
  ) {
    if (
      !postings.every((p) => Number.isSafeInteger(p.deltaCents)) ||
      postings.reduce((total, p) => total + BigInt(p.deltaCents), 0n) !== 0n
    )
      throw conflict("Muhasebe kaydı dengeli ve güvenli tamsayı olmalı.");
    const previous = await this.repository.journal(referenceId, kind);
    if (previous) {
      if (
        previous.scopeId !== scopeId ||
        JSON.stringify(previous.postings) !== JSON.stringify(postings)
      )
        throw conflict();
      return previous;
    }
    const journal = {
      id: randomUUID(),
      scopeId,
      referenceId,
      kind,
      postings,
      createdAt: new Date(),
    };
    await this.repository.post(journal);
    return journal;
  }
  capture(
    scopeId: string,
    referenceId: string,
    gross: number,
    bps: number,
    accepted: boolean,
  ) {
    return this.tx.run(() =>
      this.post(scopeId, referenceId, "capture", [
        { account: "gateway-clearing", deltaCents: -gross },
        ...(accepted
          ? [
              {
                account: `pending:${scopeId}`,
                deltaCents: gross - commission(gross, bps),
              },
              { account: "platform-fees", deltaCents: commission(gross, bps) },
            ]
          : [
              { account: `refund-liability:${referenceId}`, deltaCents: gross },
            ]),
      ]),
    );
  }
  settle(scopeId: string, referenceId: string, net: number) {
    return this.tx.run(() =>
      this.post(scopeId, referenceId, "settlement", [
        { account: `pending:${scopeId}`, deltaCents: -net },
        { account: `available:${scopeId}`, deltaCents: net },
      ]),
    );
  }
  refund(
    scopeId: string,
    referenceId: string,
    paymentReference: string,
    gross: number,
    bps: number,
    settled: boolean,
    late: boolean,
  ) {
    return this.tx.run(() =>
      this.post(scopeId, referenceId, "refund", [
        { account: "gateway-clearing", deltaCents: gross },
        ...(late
          ? [
              {
                account: `refund-liability:${paymentReference}`,
                deltaCents: -gross,
              },
            ]
          : [
              {
                account: `${settled ? "available" : "pending"}:${scopeId}`,
                deltaCents: -(gross - commission(gross, bps)),
              },
              { account: "platform-fees", deltaCents: -commission(gross, bps) },
            ]),
      ]),
    );
  }
  async summary(scopeId: string) {
    const [availableCents, pendingCents] = await Promise.all([
      this.repository.balance(`available:${scopeId}`),
      this.repository.balance(`pending:${scopeId}`),
    ]);
    return { currency: "TRY", availableCents, pendingCents };
  }
  journals(scopeId: string | undefined, query: PageQuery) {
    return this.repository.journals(scopeId, query);
  }
  async verifyBank(
    scopeId: string,
    actorId: string,
    requestId: string,
    version: number,
    owner: string,
    iban: string,
  ) {
    const compact = iban.replace(/\s/g, "").toUpperCase();
    if (!/^TR[0-9]{24}$/.test(compact))
      throw conflict("Geçerli Türkiye IBAN biçimi gerekir.");
    const rearranged = compact.slice(4) + "2927" + compact.slice(2, 4);
    let remainder = 0;
    for (const digit of rearranged)
      remainder = (remainder * 10 + Number(digit)) % 97;
    if (remainder !== 1) throw conflict("IBAN kontrol hanesi geçersiz.");
    const fingerprint = createHash("sha256")
      .update(JSON.stringify([scopeId, actorId, version, owner, compact]))
      .digest("hex");
    const previous = await this.repository.bankReceipt(requestId);
    if (previous) {
      if (previous.fingerprint !== fingerprint) throw conflict();
      return this.bankView(previous.profile);
    }
    this.integrations.require();
    const result = await this.integrations.request(
      "identity.verify",
      { referenceId: requestId, actorId, scopeId, owner, iban: compact },
      requestId,
    );
    if (
      !result.verified ||
      result.actorId !== actorId ||
      result.scopeId !== scopeId ||
      !result.holderName.trim()
    )
      throw conflict("Banka ve hesap sahipliği doğrulanamadı.");
    try {
      return await this.tx.run(async () => {
        const previous = await this.repository.bankReceipt(requestId);
        if (previous) {
          if (previous.fingerprint !== fingerprint) throw conflict();
          return this.bankView(previous.profile);
        }
        await this.users.lock(actorId);
        const saved = await this.repository.saveBank(
          {
            scopeId,
            owner: result.holderName,
            maskedIban: `TR••••${compact.slice(-4)}`,
            bankReference: result.bankReference,
            version,
            verifiedAt: new Date(),
          },
          version,
        );
        if (!saved) throw conflict();
        await this.audit.append(actorId, scopeId, "bank.verified", scopeId);
        await this.repository.createBankReceipt({
          id: requestId,
          fingerprint,
          profile: saved,
        });
        return this.bankView(saved);
      });
    } catch (error) {
      const receipt = await this.repository.bankReceipt(requestId);
      if (receipt && receipt.fingerprint === fingerprint)
        return this.bankView(receipt.profile);
      throw error;
    }
  }
  private bankView(bank: import("../domain/finance").BankProfile) {
    return {
      owner: bank.owner,
      maskedIban: bank.maskedIban,
      version: bank.version,
      verifiedAt: bank.verifiedAt,
    };
  }
  async bank(scopeId: string) {
    const bank = await this.repository.bank(scopeId);
    return bank
      ? {
          owner: bank.owner,
          maskedIban: bank.maskedIban,
          version: bank.version,
          verifiedAt: bank.verifiedAt,
        }
      : null;
  }
  async withdraw(
    scopeId: string,
    actorId: string,
    id: string,
    amountCents: number,
  ) {
    this.integrations.require();
    return this.tx.run(async () => {
      const old = await this.repository.withdrawal(id);
      if (old) {
        if (
          old.scopeId !== scopeId ||
          old.actorId !== actorId ||
          old.amountCents !== amountCents
        )
          throw conflict();
        return old;
      }
      const bank = await this.repository.bank(scopeId);
      if (!bank) throw conflict("Doğrulanmış banka hesabı gerekir.");
      if (!(await this.repository.debit(`available:${scopeId}`, amountCents)))
        throw conflict("Kullanılabilir bakiye yetersiz.");
      await this.post(scopeId, id, "withdrawal-reserve", [
        { account: `reserved:${id}`, deltaCents: amountCents },
        { account: `available:${scopeId}`, deltaCents: -amountCents },
      ]);
      const withdrawal = {
        id,
        scopeId,
        actorId,
        amountCents,
        bankReference: bank.bankReference,
        status: "review" as const,
        version: 0,
        createdAt: new Date(),
      };
      await this.repository.createWithdrawal(withdrawal);
      await this.audit.append(actorId, scopeId, "withdrawal.request", id);
      return withdrawal;
    });
  }
  withdrawalView({
    bankReference: _bank,
    actorId: _actor,
    reviewedBy: _reviewer,
    ...view
  }: Withdrawal) {
    return view;
  }
  async withdrawals(
    scopeId: string | undefined,
    query: PageQuery,
    status?: Withdrawal["status"],
  ) {
    const page = await this.repository.withdrawals(scopeId, query, status);
    return {
      ...page,
      items: page.items.map((item) => this.withdrawalView(item)),
    };
  }
  async reviewWithdrawal(
    id: string,
    version: number,
    actorId: string,
    action: "approve" | "reject",
    reason: string,
  ) {
    if (action === "approve") this.integrations.require();
    return this.tx.run(async () => {
      const withdrawal = await this.withdrawal(id);
      if (withdrawal.version !== version || withdrawal.status !== "review")
        throw conflict();
      // A suspended requester must not be dispatched; rejection can still release their funds.
      if (action === "approve") await this.users.lock(withdrawal.actorId);
      if (action === "approve")
        await this.jobs.enqueue(
          id,
          withdrawal.scopeId,
          withdrawal.actorId,
          "payout.create",
          {
            referenceId: id,
            amountCents: withdrawal.amountCents,
            currency: "TRY",
            bankReference: withdrawal.bankReference,
          },
        );
      else
        await this.post(withdrawal.scopeId, id, "withdrawal-reject", [
          { account: `reserved:${id}`, deltaCents: -withdrawal.amountCents },
          {
            account: `available:${withdrawal.scopeId}`,
            deltaCents: withdrawal.amountCents,
          },
        ]);
      const saved = await this.repository.saveWithdrawal(
        {
          ...withdrawal,
          status: action === "approve" ? "pending" : "rejected",
          reviewedBy: actorId,
          reviewedAt: new Date(),
          reviewReason: reason,
        },
        version,
      );
      if (!saved) throw conflict();
      await this.audit.append(
        actorId,
        withdrawal.scopeId,
        `withdrawal.${action}`,
        id,
      );
      return this.withdrawalView(saved);
    });
  }
  async withdrawal(id: string) {
    const withdrawal = await this.repository.withdrawal(id);
    if (!withdrawal) throw notFound();
    return withdrawal;
  }
  async completeWithdrawal(id: string, amountCents: number, success: boolean) {
    return this.tx.run(async () => {
      const withdrawal = await this.withdrawal(id);
      if (withdrawal.amountCents !== amountCents) throw conflict();
      if (withdrawal.status === "cancelled" && !success) return withdrawal;
      if (withdrawal.status !== "pending") {
        if (withdrawal.status !== (success ? "paid" : "failed"))
          throw conflict("Çelişkili ödeme sonucu.");
        return withdrawal;
      }
      await this.post(withdrawal.scopeId, id, "withdrawal-result", [
        { account: `reserved:${id}`, deltaCents: -amountCents },
        {
          account: success
            ? "gateway-clearing"
            : `available:${withdrawal.scopeId}`,
          deltaCents: amountCents,
        },
      ]);
      const saved = await this.repository.saveWithdrawal(
        { ...withdrawal, status: success ? "paid" : "failed" },
        withdrawal.version,
      );
      if (!saved) throw conflict();
      return saved;
    });
  }
  async cancelWithdrawal(id: string, actorId: string) {
    const initial = await this.withdrawal(id);
    if (initial.actorId !== actorId) throw notFound();
    if (initial.status === "cancelled") return initial;
    if (!["review", "pending"].includes(initial.status)) throw conflict();
    const dispatch =
      initial.status === "pending" ? await this.jobs.get(id) : null;
    let confirmed = false;
    if (dispatch && dispatch.attempts > 0) {
      const cancelled = await this.integrations.request(
        "payout.cancel",
        { referenceId: id },
        `cancel:${id}`,
      );
      if (!cancelled.cancelled)
        throw conflict("Sağlayıcı para çekme işlemini iptal edemedi.");
      confirmed = true;
    }
    return this.tx.run(async () => {
      const withdrawal = await this.withdrawal(id);
      if (withdrawal.actorId !== actorId) throw notFound();
      if (!["review", "pending"].includes(withdrawal.status)) throw conflict();
      if (withdrawal.status === "pending")
        await this.jobs.cancel(id, actorId, confirmed);
      await this.post(withdrawal.scopeId, id, "withdrawal-cancel", [
        { account: `reserved:${id}`, deltaCents: -withdrawal.amountCents },
        {
          account: `available:${withdrawal.scopeId}`,
          deltaCents: withdrawal.amountCents,
        },
      ]);
      const saved = await this.repository.saveWithdrawal(
        { ...withdrawal, status: "cancelled" },
        withdrawal.version,
      );
      if (!saved) throw conflict();
      return saved;
    });
  }
  async fund(scopeId: string, referenceId: string, amount: number) {
    const prior = await this.repository.journal(referenceId, "supply-funding");
    if (prior)
      return this.post(scopeId, referenceId, "supply-funding", [
        { account: `available:${scopeId}`, deltaCents: -amount },
        { account: `supply-escrow:${referenceId}`, deltaCents: amount },
      ]);
    if (!(await this.repository.debit(`available:${scopeId}`, amount)))
      throw conflict("Tedarik siparişi için kullanılabilir bakiye yetersiz.");
    return this.post(scopeId, referenceId, "supply-funding", [
      { account: `available:${scopeId}`, deltaCents: -amount },
      { account: `supply-escrow:${referenceId}`, deltaCents: amount },
    ]);
  }
  unfund(scopeId: string, referenceId: string, amount: number) {
    return this.post(scopeId, referenceId, "supply-cancel", [
      { account: `available:${scopeId}`, deltaCents: amount },
      { account: `supply-escrow:${referenceId}`, deltaCents: -amount },
    ]);
  }
  settleSupply(
    storeId: string,
    partnerId: string,
    referenceId: string,
    amount: number,
    bps: number,
  ) {
    return this.post(storeId, referenceId, "supply-settlement", [
      { account: `supply-escrow:${referenceId}`, deltaCents: -amount },
      {
        account: `available:${partnerId}`,
        deltaCents: amount - commission(amount, bps),
      },
      { account: "platform-fees", deltaCents: commission(amount, bps) },
    ]);
  }

  studioRevenue(
    scopeId: string,
    referenceId: string,
    amount: number,
    refunded: boolean,
  ) {
    return this.post(
      scopeId,
      `studio:${referenceId}`,
      refunded ? "studio-refund" : "studio-capture",
      [
        {
          account: "gateway-clearing",
          deltaCents: refunded ? amount : -amount,
        },
        { account: "studio-revenue", deltaCents: refunded ? -amount : amount },
      ],
    );
  }
  referralReward(
    ownerId: string,
    sourceId: string,
    reward: number,
    reversal: boolean,
  ) {
    return this.post(
      ownerId,
      `referral:${sourceId}`,
      reversal ? "referral-reversal" : "referral-reward",
      [
        { account: "platform-fees", deltaCents: reversal ? reward : -reward },
        {
          account: `available:${ownerId}`,
          deltaCents: reversal ? -reward : reward,
        },
      ],
    );
  }
  async onboarding(scopeId: string, actorId: string, id: string) {
    const user = await this.users.findById(actorId);
    if (!user) throw notFound();
    return this.integrations.request(
      "identity.onboard",
      {
        referenceId: id,
        actorId,
        scopeId,
        name: user.name,
        email: user.email,
        returnUrl: `${this.config.frontendOrigin}/banka-dogrulama-sonucu?reference=${id}`,
      },
      id,
    );
  }
}
