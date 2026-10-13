import { PartnersService } from "../../partners/application/partners.service";
import { randomUUID } from "node:crypto";
import { Inject, Injectable } from "@nestjs/common";
import { STUDIO, type StudioRepository } from "./studio.repository";
import type { StudioInput, StudioPolicy } from "../domain/studio";
import { JobsService } from "../../jobs/application/jobs.service";
import { IntegrationsService } from "../../integrations/application/integrations.service";
import { CatalogService } from "../../catalog/application/catalog.service";
import { MediaService } from "../../media/application/media.service";
import { FinanceService } from "../../finance/application/finance.service";
import { UsersService } from "../../users/application/users.service";
import { AuditService } from "../../audit/application/audit.service";
import {
  TRANSACTIONS,
  type TransactionRunner,
} from "../../../shared/transactions";
import { CONFIG, type AppConfig } from "../../../config/config";
import { conflict, notFound, unavailable } from "../../../shared/errors";
import type { PageQuery } from "../../../shared/page";
@Injectable()
export class StudioService {
  constructor(
    @Inject(STUDIO) private readonly repository: StudioRepository,
    private readonly jobs: JobsService,
    private readonly integrations: IntegrationsService,
    private readonly catalog: CatalogService,
    private readonly partners: PartnersService,
    private readonly media: MediaService,
    private readonly finance: FinanceService,
    private readonly users: UsersService,
    private readonly audit: AuditService,
    @Inject(TRANSACTIONS) private readonly tx: TransactionRunner,
    @Inject(CONFIG) private readonly config: AppConfig,
  ) {}
  policy() {
    return this.repository.policy();
  }
  async configure(
    version: number,
    input: StudioPolicy["costs"],
    creditPriceCents: number,
    actorId: string,
  ) {
    return this.tx.run(async () => {
      const saved = await this.repository.savePolicy(
        { id: "studio", costs: input, creditPriceCents, version },
        version,
      );
      if (!saved) throw conflict();
      await this.audit.append(actorId, "studio", "studio.policy", "studio");
      return saved;
    });
  }
  balance(scopeId: string) {
    return this.repository.balance(scopeId);
  }
  async grant(scopeId: string, id: string, credits: number, actorId: string) {
    return this.tx.run(async () => {
      const old = await this.repository.lot(id);
      if (old) {
        if (
          old.scopeId !== scopeId ||
          old.available + old.held + old.spent !== credits ||
          old.refundable
        )
          throw conflict();
        return this.balance(scopeId);
      }
      await this.repository.createLot({
        id,
        scopeId,
        available: credits,
        held: 0,
        spent: 0,
        refundable: false,
      });
      await this.audit.append(actorId, scopeId, "studio.credit-grant", id);
      return this.balance(scopeId);
    });
  }
  async create(
    scopeId: string,
    actorId: string,
    id: string,
    input: StudioInput,
    targetKind: "store" | "supplier" = "store",
  ) {
    this.integrations.require();
    const policy = await this.repository.policy();
    if (!policy) throw unavailable("AI kredi politikası yapılandırılmadı.");
    if (targetKind === "supplier")
      await this.partners.product(scopeId, input.productId);
    else await this.catalog.product(scopeId, input.productId);
    await this.media.assertOwned(scopeId, [input.sourceUrl], "product");
    return this.tx.run(async () => {
      await this.users.lock(actorId);
      const previous = await this.repository.job(id);
      if (previous) {
        const before = {
          productId: previous.productId,
          sourceUrl: previous.sourceUrl,
          mode: previous.mode,
          prompt: previous.prompt,
          ratio: previous.ratio,
        };
        if (
          (previous.targetKind ?? "store") !== targetKind ||
          previous.scopeId !== scopeId ||
          previous.actorId !== actorId ||
          JSON.stringify(before) !== JSON.stringify(input)
        )
          throw conflict();
        return previous;
      }
      const cost = policy.costs[input.mode],
        allocations: { lotId: string; credits: number }[] = [];
      let remaining = cost;
      while (remaining > 0) {
        const allocation = await this.repository.reserveLot(scopeId, remaining);
        if (!allocation) throw conflict("AI kredisi yetersiz.");
        allocations.push(allocation);
        remaining -= allocation.credits;
      }
      const job = {
        ...input,
        id,
        scopeId,
        actorId,
        cost,
        policyVersion: policy.version,
        targetKind,
        status: "queued" as const,
        outputs: [],
        allocations,
        version: 0,
        createdAt: new Date(),
      };
      await this.repository.createJob(job);
      await this.jobs.enqueue(id, scopeId, actorId, "ai.generate", {
        referenceId: id,
        sourceUrl: new URL(input.sourceUrl, this.config.frontendOrigin).href,
        mode: input.mode,
        prompt: input.prompt,
        ratio: input.ratio,
      });
      return job;
    });
  }
  async get(scopeId: string, id: string) {
    const job = await this.repository.job(id);
    if (!job || job.scopeId !== scopeId) throw notFound();
    return job;
  }
  list(scopeId: string, query: PageQuery) {
    return this.repository.list(scopeId, query);
  }
  async cancel(scopeId: string, id: string, actorId: string) {
    const initial = await this.get(scopeId, id);
    if (initial.actorId !== actorId) throw notFound();
    if (initial.status === "cancelled") return { cancelled: true };
    if (initial.status !== "queued") throw conflict();
    const dispatch = await this.jobs.get(id);
    let confirmed = false;
    if (dispatch.attempts > 0) {
      const result = await this.integrations.request(
        "ai.cancel",
        { referenceId: id },
        `cancel:${id}`,
      );
      if (!result.cancelled)
        throw conflict("Sağlayıcı çalışan işi iptal edemedi.");
      confirmed = true;
    }
    return this.tx.run(async () => {
      const job = await this.get(scopeId, id);
      if (job.actorId !== actorId || job.status !== "queued") throw conflict();
      await this.jobs.cancel(id, actorId, confirmed);
      for (const allocation of job.allocations)
        if (
          !(await this.repository.releaseLot(
            allocation.lotId,
            allocation.credits,
            false,
          ))
        )
          throw conflict();
      if (
        !(await this.repository.saveJob(
          { ...job, status: "cancelled" },
          job.version,
        ))
      )
        throw conflict();
      return { cancelled: true };
    });
  }
  async prepare(id: string, count: number) {
    const job = await this.repository.job(id);
    if (!job) throw notFound();
    if (job.status === "completed") return job.outputs;
    if (job.status !== "queued") throw conflict();
    const outputs: string[] = [];
    for (let index = 0; index < count; index++) {
      const buffer = await this.integrations.image(id, index);
      outputs.push(
        (
          await this.media.upload(job.scopeId, "product", {
            buffer,
            size: buffer.length,
          })
        ).url,
      );
    }
    return outputs;
  }
  async complete(id: string, success: boolean, outputs: string[]) {
    const job = await this.repository.job(id);
    if (!job) throw notFound();
    if (success) await this.media.assertOwned(job.scopeId, outputs, "product");
    if (job.status === "cancelled" && !success) return;
    if (job.status !== "queued") {
      if (job.status === (success ? "completed" : "failed")) return;
      throw conflict();
    }
    for (const allocation of job.allocations)
      if (
        !(await this.repository.releaseLot(
          allocation.lotId,
          allocation.credits,
          success,
        ))
      )
        throw conflict();
    if (
      !(await this.repository.saveJob(
        { ...job, status: success ? "completed" : "failed", outputs },
        job.version,
      ))
    )
      throw conflict();
    await this.jobs.complete(id, success);
    await this.audit.append(
      "provider",
      job.scopeId,
      success ? "studio.completed" : "studio.failed",
      id,
    );
  }
  async publish(
    scopeId: string,
    id: string,
    cover: boolean,
    version: number,
    actorId?: string,
  ) {
    const job = await this.get(scopeId, id);
    if (job.status !== "completed" || !job.outputs.length) throw conflict();
    const product =
      job.targetKind === "supplier"
        ? await this.partners.product(scopeId, job.productId)
        : await this.catalog.product(scopeId, job.productId);
    if (product.version !== version) throw conflict();
    const images = (
      cover
        ? [...job.outputs, ...product.images]
        : [...product.images, ...job.outputs]
    )
      .filter((url, index, all) => all.indexOf(url) === index)
      .slice(0, 6);
    if (job.targetKind === "supplier") {
      if (!actorId) throw notFound();
      return this.partners.saveProduct(
        scopeId,
        actorId,
        {
          ...(product as import("../../partners/domain/partner").SupplyProduct),
          images,
        },
        job.productId,
        version,
      );
    }
    return this.catalog.update(
      scopeId,
      product.id,
      {
        ...(product as import("../../catalog/domain/product").Product),
        images,
      },
      version,
    );
  }
  async purchase(
    scopeId: string,
    actorId: string,
    id: string,
    credits: number,
  ) {
    this.integrations.require();
    const policy = await this.repository.policy();
    if (!policy) throw unavailable("AI fiyat politikası yapılandırılmadı.");
    const amountCents = credits * policy.creditPriceCents;
    if (!Number.isSafeInteger(amountCents) || amountCents > 9999999999)
      throw conflict();
    return this.tx.run(async () => {
      const old = await this.repository.purchase(id);
      if (old) {
        if (
          old.scopeId !== scopeId ||
          old.actorId !== actorId ||
          old.credits !== credits
        )
          throw conflict();
        return old;
      }
      const purchase = {
        id,
        scopeId,
        actorId,
        credits,
        amountCents,
        status: "pending" as const,
        providerReference: "",
        createdAt: new Date(),
      };
      await this.repository.createPurchase(purchase);
      const user = await this.users.findById(actorId);
      if (!user) throw notFound();
      await this.jobs.enqueue(id, scopeId, actorId, "payment.create", {
        referenceId: id,
        amountCents,
        currency: "TRY",
        customerEmail: user.email,
        returnUrl: `${this.config.frontendOrigin}/ai-kredi-sonucu?purchase=${id}`,
      });
      return purchase;
    });
  }
  async capturePurchase(
    id: string,
    amountCents: number,
    providerReference: string,
  ) {
    const purchase = await this.repository.purchase(id);
    if (!purchase || purchase.amountCents !== amountCents || !providerReference)
      throw conflict();
    if (!["pending", "failed"].includes(purchase.status)) return;
    if (
      !(await this.repository.savePurchase(
        { ...purchase, status: "paid", providerReference },
        purchase.status,
      ))
    )
      throw conflict();
    await this.repository.createLot({
      id,
      scopeId: purchase.scopeId,
      available: purchase.credits,
      held: 0,
      spent: 0,
      refundable: true,
    });
    await this.finance.studioRevenue(purchase.scopeId, id, amountCents, false);
  }

  async failPurchase(id: string, amountCents: number) {
    const purchase = await this.repository.purchase(id);
    if (!purchase || purchase.amountCents !== amountCents) throw conflict();
    if (purchase.status !== "pending") return purchase.status === "failed";
    if (
      !(await this.repository.savePurchase(
        { ...purchase, status: "failed" },
        "pending",
      ))
    )
      throw conflict();
    return true;
  }

  async refundPurchase(scopeId: string, id: string, actorId: string) {
    this.integrations.require();
    return this.tx.run(async () => {
      const purchase = await this.repository.purchase(id);
      if (
        !purchase ||
        purchase.scopeId !== scopeId ||
        purchase.actorId !== actorId
      )
        throw notFound();
      if (purchase.status === "refund-pending")
        return { id: purchase.refundId, status: purchase.status };
      if (purchase.status !== "paid") throw conflict();
      if (!(await this.repository.refundLot(id, purchase.credits)))
        throw conflict("Kullanılmış veya ayrılmış kredi paketi iade edilemez.");
      const refundId = randomUUID();
      if (
        !(await this.repository.savePurchase(
          { ...purchase, status: "refund-pending", refundId },
          "paid",
        ))
      )
        throw conflict();
      await this.jobs.enqueue(refundId, scopeId, actorId, "payment.refund", {
        referenceId: refundId,
        paymentReference: purchase.providerReference,
        amountCents: purchase.amountCents,
        currency: "TRY",
      });
      return { id: refundId, status: "refund-pending" };
    });
  }
  async refundCredit(id: string, amountCents: number, success = true) {
    const purchase = await this.repository.purchaseByRefund(id);
    if (!purchase || purchase.amountCents !== amountCents) throw conflict();
    if (purchase.status === "refunded" && success) return;
    if (purchase.status !== "refund-pending") throw conflict();
    if (
      !success &&
      !(await this.repository.restoreLot(purchase.id, purchase.credits))
    )
      throw conflict();
    if (
      !(await this.repository.savePurchase(
        { ...purchase, status: success ? "refunded" : "paid" },
        "refund-pending",
      ))
    )
      throw conflict();
    if (success)
      await this.finance.studioRevenue(
        purchase.scopeId,
        purchase.id,
        amountCents,
        true,
      );
  }
}
