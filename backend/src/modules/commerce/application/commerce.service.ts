import { providerEventSchema } from "./provider-event.schema";
import { InvoicesService } from "../../invoices/application/invoices.service";
import { ReferralsService } from "../../referrals/application/referrals.service";
import { StoresService } from "../../stores/application/stores.service";
import { CrmService } from "../../crm/application/crm.service";
import { Inject, Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { COMMERCE, type CommerceRepository } from "./commerce.repository";
import type { ProviderEventInput } from "../domain/commerce";
import { CouponsService } from "../../coupons/application/coupons.service";
import { StudioService } from "../../studio/application/studio.service";
import { NotificationsService } from "../../notifications/application/notifications.service";
import { WholesaleService } from "../../wholesale/application/wholesale.service";
import { EngagementService } from "../../engagement/application/engagement.service";
import { buyerOrderView, type OrderInput } from "../../orders/domain/order";
import { OrdersService } from "../../orders/application/orders.service";
import { FinanceService } from "../../finance/application/finance.service";
import { commission } from "../../finance/domain/finance";
import { JobsService } from "../../jobs/application/jobs.service";
import { IntegrationsService } from "../../integrations/application/integrations.service";
import { AuditService } from "../../audit/application/audit.service";
import { CONFIG, type AppConfig } from "../../../config/config";
import {
  TRANSACTIONS,
  type TransactionRunner,
} from "../../../shared/transactions";
import { conflict, notFound } from "../../../shared/errors";
@Injectable()
export class CommerceService {
  constructor(
    @Inject(COMMERCE) private readonly repository: CommerceRepository,
    private readonly orders: OrdersService,
    private readonly invoices: InvoicesService,
    private readonly engagement: EngagementService,
    private readonly wholesale: WholesaleService,
    private readonly crm: CrmService,
    private readonly referrals: ReferralsService,
    private readonly stores: StoresService,
    private readonly notifications: NotificationsService,
    private readonly studio: StudioService,
    private readonly coupons: CouponsService,
    private readonly finance: FinanceService,
    private readonly jobs: JobsService,
    private readonly integrations: IntegrationsService,
    private readonly audit: AuditService,
    @Inject(TRANSACTIONS) private readonly tx: TransactionRunner,
    @Inject(CONFIG) private readonly config: AppConfig,
  ) {}
  async startPayment(
    storeId: string,
    orderId: string,
    actorId: string,
    id: string,
    buyer = false,
    couponCode = "",
  ) {
    this.integrations.require();
    const prior = await this.repository.orderPayment(orderId);
    if (prior) {
      if ((prior.couponCode ?? "") !== couponCode)
        throw conflict("Ödeme hazırlığında kupon değiştirilemez.");
      await this.orders.get(storeId, orderId, buyer ? actorId : undefined);
      return this.paymentView(prior.id, storeId);
    }
    const policy = await this.finance.requiredPolicy(storeId),
      order = await this.orders.get(
        storeId,
        orderId,
        buyer ? actorId : undefined,
      );
    if (
      order.payment !== "pending" ||
      order.reservation !== "held" ||
      order.expiresAt.getTime() <= Date.now()
    )
      throw conflict();
    let shippingCents = policy.fixedShippingCents,
      carrier = order.carrier;
    if (policy.shippingMode === "provider") {
      const quote = await this.integrations.request(
        "shipping.quote",
        {
          referenceId: id,
          shipperScopeId: storeId,
          city: order.city,
          address: order.address,
          items: order.items.map((item) => ({
            sku: item.sku,
            quantity: item.quantity,
          })),
        },
        `quote:${id}`,
      );
      if (new Date(quote.expiresAt).getTime() <= Date.now())
        throw conflict("Teslimat teklifi süresi dolmuş.");
      shippingCents = quote.amountCents;
      carrier = quote.carrier;
    }
    return this.tx.run(async () => {
      const existing = await this.repository.orderPayment(orderId);
      if (existing) {
        if ((existing.couponCode ?? "") !== couponCode) throw conflict();
        return this.paymentView(existing.id, storeId);
      }
      const discountCents = couponCode
        ? await this.coupons.claim(
            storeId,
            orderId,
            order.buyerId,
            couponCode,
            order.items.reduce(
              (sum, item) => sum + item.unitCents * item.quantity,
              0,
            ),
          )
        : 0;
      if ((await this.stores.byId(storeId)).platformSuspended)
        throw conflict("Mağaza satışa kapalı.");
      const priced = await this.orders.price(storeId, orderId, order.version, {
        shippingCents,
        discountCents,
        commissionBasisPoints: policy.commissionBasisPoints!,
        returnDays: policy.returnDays!,
        pricingVersion: policy.version,
      });
      await this.orders.save(
        { ...priced, checkoutLocked: true, carrier },
        priced.version,
      );
      const payment = {
        id,
        storeId,
        orderId,
        actorId,
        couponCode,
        amountCents: priced.totalCents,
        commissionBasisPoints: policy.commissionBasisPoints!,
        status: "pending" as const,
        version: 0,
        createdAt: new Date(),
      };
      await this.repository.createPayment(payment);
      await this.jobs.enqueue(id, storeId, actorId, "payment.create", {
        referenceId: id,
        amountCents: payment.amountCents,
        currency: "TRY",
        customerEmail: priced.email,
        returnUrl: `${this.config.frontendOrigin}/odeme-sonucu?payment=${id}`,
      });
      await this.audit.append(actorId, storeId, "payment.request", id);
      return this.paymentView(id, storeId);
    });
  }
  async buyerPaymentView(storeId: string, orderId: string, buyerId: string) {
    await this.orders.get(storeId, orderId, buyerId);
    const payment = await this.repository.orderPayment(orderId);
    return payment ? this.paymentView(payment.id, storeId) : null;
  }
  async paymentView(id: string, storeId: string) {
    const payment = await this.repository.payment(id);
    if (!payment || payment.storeId !== storeId) throw notFound();
    const job = await this.jobs.get(id);
    const result = job.result;
    return {
      id: payment.id,
      orderId: payment.orderId,
      status: payment.status,
      amountCents: payment.amountCents,
      currency: "TRY",
      jobStatus: job.status,
      checkoutUrl:
        result && "checkoutUrl" in result ? result.checkoutUrl : null,
    };
  }
  async shipment(storeId: string, orderId: string) {
    await this.orders.get(storeId, orderId);
    const shipment = await this.repository.orderShipment(orderId);
    if (!shipment) return null;
    const job = await this.jobs.get(shipment.id),
      result = job.result;
    return result && "tracking" in result
      ? {
          ...shipment,
          tracking: shipment.tracking || result.tracking,
          labelUrl: shipment.labelUrl || result.labelUrl,
        }
      : shipment;
  }
  async startShipment(
    storeId: string,
    orderId: string,
    actorId: string,
    id: string,
    carrier: string,
  ) {
    this.integrations.require();
    return this.tx.run(async () => {
      const old = await this.repository.orderShipment(orderId);
      if (old) {
        if (old.storeId !== storeId) throw notFound();
        return old;
      }
      const order = await this.orders.get(storeId, orderId);
      if (
        order.payment !== "paid" ||
        order.shipment !== "preparing" ||
        order.financialState === "refundPending"
      )
        throw conflict("Ödenmiş ve iadeye alınmamış sipariş gerekir.");
      await this.orders.save(order, order.version);
      const shipment = {
        id,
        storeId,
        orderId,
        status: "requested" as const,
        carrier,
        tracking: "",
        labelUrl: "",
        version: 0,
        createdAt: new Date(),
      };
      await this.repository.createShipment(shipment);
      await this.jobs.enqueue(id, storeId, actorId, "shipping.create", {
        referenceId: id,
        shipperScopeId: storeId,
        orderId,
        carrier,
        city: order.city,
        address: order.address,
        customer: order.customer,
        phone: order.phone,
        items: order.items.map((item) => ({
          sku: item.sku,
          quantity: item.quantity,
        })),
      });
      await this.audit.append(actorId, storeId, "shipment.request", id);
      return shipment;
    });
  }
  async requestReturn(
    storeId: string,
    orderId: string,
    buyerId: string,
    id: string,
    reason: string,
  ) {
    return this.tx.run(async () => {
      const order = await this.orders.get(storeId, orderId, buyerId),
        previous = await this.repository.orderRefund(orderId);
      if (previous) {
        if (previous.buyerId !== buyerId || previous.reason !== reason)
          throw conflict();
        return previous;
      }
      if (
        order.payment !== "paid" ||
        order.shipment !== "delivered" ||
        !order.deliveredAt ||
        Date.now() >
          order.deliveredAt.getTime() + (order.returnDays ?? 0) * 86400000
      )
        throw conflict("Sipariş iadeye uygun değil veya süre dolmuş.");
      const payment = await this.repository.orderPayment(orderId);
      if (!payment || payment.status !== "captured") throw conflict();
      const refund = {
        id,
        storeId,
        orderId,
        buyerId,
        paymentId: payment.id,
        reason,
        status: "requested" as const,
        restock: false,
        settled: order.financialState === "settled",
        late: false,
        version: 0,
        createdAt: new Date(),
      };
      await this.orders.save(
        { ...order, financialState: "refundPending" },
        order.version,
      );
      await this.repository.createRefund(refund);
      await this.audit.append(buyerId, storeId, "return.request", id);
      return refund;
    });
  }
  async returnView(storeId: string, orderId: string, buyerId?: string) {
    await this.orders.get(storeId, orderId, buyerId);
    return this.repository.orderRefund(orderId);
  }
  async returnAction(
    storeId: string,
    id: string,
    actorId: string,
    version: number,
    action: "approve" | "reject" | "receive",
    restock: boolean,
  ) {
    if (action === "receive") this.integrations.require();
    return this.tx.run(async () => {
      const refund = await this.repository.refund(id);
      if (!refund || refund.storeId !== storeId) throw notFound();
      if (
        refund.version !== version ||
        (action === "receive" && refund.status !== "approved") ||
        (action !== "receive" && refund.status !== "requested")
      )
        throw conflict();
      const order = await this.orders.get(storeId, refund.orderId);
      const status =
        action === "approve"
          ? "approved"
          : action === "reject"
            ? "rejected"
            : "received";
      if (action === "reject")
        await this.orders.save(
          { ...order, financialState: refund.settled ? "settled" : "pending" },
          order.version,
        );
      if (action === "receive") {
        const paymentJob = await this.jobs.get(refund.paymentId);
        const payment = await this.repository.payment(refund.paymentId),
          providerReference =
            payment?.providerReference ||
            (paymentJob.result && "providerReference" in paymentJob.result
              ? paymentJob.result.providerReference
              : "");
        if (!providerReference)
          throw conflict("Ödeme sağlayıcı referansı henüz hazır değil.");
        await this.jobs.enqueue(id, storeId, actorId, "payment.refund", {
          referenceId: id,
          paymentReference: providerReference,
          amountCents: order.totalCents,
          currency: "TRY",
        });
      }
      const saved = await this.repository.saveRefund(
        { ...refund, status, restock: action === "receive" && restock },
        version,
      );
      if (!saved) throw conflict();
      await this.audit.append(actorId, storeId, `return.${action}`, id);
      return saved;
    });
  }
  async event(input: ProviderEventInput, originalPayload: unknown = input) {
    const replay = await this.jobs.replay(
      input.eventId,
      input.referenceId,
      input.kind,
      originalPayload,
    );
    if (replay) return replay;
    const preflight = await this.jobs.get(input.referenceId);
    let outputs: string[] = [];
    if (input.kind === "ai.completed") {
      if (
        preflight.operation !== "ai.generate" ||
        preflight.attempts === 0 ||
        !input.outputCount
      )
        throw conflict();
      outputs = await this.studio.prepare(input.referenceId, input.outputCount);
    }
    return this.jobs.event(
      input.eventId,
      input.referenceId,
      input.kind,
      originalPayload,
      async () => {
        const job = await this.jobs.get(input.referenceId);
        if (job.attempts === 0)
          throw conflict(
            "Henüz sağlayıcıya gönderilmeyen işlem teyit edilemez.",
          );
        if (
          input.providerReference &&
          job.result &&
          "providerReference" in job.result &&
          input.providerReference !== job.result.providerReference
        )
          throw conflict("Sağlayıcı işlem referansı eşleşmiyor.");
        if (
          input.tracking &&
          job.result &&
          "tracking" in job.result &&
          input.tracking !== job.result.tracking
        )
          throw conflict("Sağlayıcı gönderi referansı eşleşmiyor.");
        if (input.kind === "payment.captured") {
          if (job.operation !== "payment.create") throw conflict();
          const payment = await this.repository.payment(input.referenceId);
          if (!payment) {
            const providerReference =
              input.providerReference ||
              (job.result && "providerReference" in job.result
                ? job.result.providerReference
                : "");
            await this.studio.capturePurchase(
              input.referenceId,
              input.amountCents,
              providerReference,
            );
            await this.jobs.complete(job.id, true);
            return;
          }
          if (payment.amountCents !== input.amountCents)
            throw conflict("Ödeme olayı tutarı eşleşmiyor.");
          if (!["pending", "failed"].includes(payment.status)) {
            if (
              !["captured", "captured-late", "refunded"].includes(
                payment.status,
              )
            )
              throw conflict();
            return;
          }
          const providerReference =
            input.providerReference ||
            (job.result && "providerReference" in job.result
              ? job.result.providerReference
              : "");
          if (!providerReference)
            throw conflict("Ödeme sağlayıcı referansı eksik.");
          const captured = await this.orders.capture(
            payment.storeId,
            payment.orderId,
            input.amountCents,
          );
          if (captured.accepted) await this.crm.recordOrder(captured.order);
          await this.finance.capture(
            payment.storeId,
            payment.id,
            payment.amountCents,
            payment.commissionBasisPoints,
            captured.accepted,
          );
          if (captured.accepted && captured.order.buyerId)
            await this.notifications.notify(
              captured.order.buyerId,
              `payment:${payment.id}`,
              "Ödeme teyidi alındı",
              "Sipariş ödemeniz sağlayıcı tarafından teyit edildi.",
              `/hesabim/siparisler/${payment.orderId}`,
            );
          const saved = await this.repository.savePayment(
            {
              ...payment,
              providerReference,
              status: captured.accepted ? "captured" : "captured-late",
            },
            payment.version,
          );
          if (!saved) throw conflict();
          if (!captured.accepted) {
            const refundId = randomUUID();
            await this.repository.createRefund({
              id: refundId,
              storeId: payment.storeId,
              orderId: payment.orderId,
              buyerId: captured.order.buyerId,
              paymentId: payment.id,
              reason: "Late provider capture after reservation expiration",
              status: "received",
              restock: false,
              settled: false,
              late: true,
              version: 0,
              createdAt: new Date(),
            });
            await this.jobs.enqueue(
              refundId,
              payment.storeId,
              payment.actorId,
              "payment.refund",
              {
                referenceId: refundId,
                paymentReference: providerReference,
                amountCents: payment.amountCents,
                currency: "TRY",
              },
            );
          }
        } else if (input.kind === "refund.completed") {
          if (job.operation !== "payment.refund") throw conflict();
          const refund = await this.repository.refund(input.referenceId);
          if (!refund) {
            await this.studio.refundCredit(
              input.referenceId,
              input.amountCents,
              true,
            );
            await this.jobs.complete(job.id, true);
            return;
          }
          const payment = await this.repository.payment(refund.paymentId);
          if (!payment || payment.amountCents !== input.amountCents)
            throw conflict();
          if (refund.status === "refunded") return;
          if (refund.status !== "received") throw conflict();
          await this.finance.refund(
            payment.storeId,
            refund.id,
            payment.id,
            input.amountCents,
            payment.commissionBasisPoints,
            refund.settled,
            refund.late,
          );
          if (!refund.late)
            await this.orders.refund(
              payment.storeId,
              payment.orderId,
              refund.restock,
            );
          if (!refund.late) await this.invoices.refunded(payment.orderId);
          if (!refund.late) await this.referrals.refund(payment.orderId);
          if (!refund.late)
            await this.crm.recordOrder(
              await this.orders.get(payment.storeId, payment.orderId),
            );
          if (
            !(await this.repository.saveRefund(
              { ...refund, status: "refunded" },
              refund.version,
            )) ||
            !(await this.repository.savePayment(
              { ...payment, status: "refunded" },
              payment.version,
            ))
          )
            throw conflict();
        } else if (
          input.kind === "shipment.shipped" ||
          input.kind === "shipment.delivered"
        ) {
          if (
            job.operation !== "shipping.create" ||
            !input.tracking ||
            !input.carrier
          )
            throw conflict();
          const shipment = await this.repository.shipment(input.referenceId);
          if (!shipment) {
            await this.wholesale.providerShipment(
              input.referenceId,
              input.tracking,
              input.kind === "shipment.delivered",
            );
            if (input.kind === "shipment.delivered")
              await this.jobs.complete(job.id, true);
            return;
          }
          if (shipment.tracking && shipment.tracking !== input.tracking)
            throw conflict();
          if (
            shipment.status === "delivered" &&
            input.kind === "shipment.shipped"
          )
            return;
          const order = await this.orders.get(
            shipment.storeId,
            shipment.orderId,
          );
          if (order.shipment === "preparing")
            await this.orders.shipped(
              shipment.storeId,
              shipment.orderId,
              input.tracking,
              input.carrier,
            );
          if (
            input.kind === "shipment.delivered" &&
            order.shipment !== "delivered"
          )
            await this.orders.delivered(shipment.storeId, shipment.orderId);
          if (
            !(await this.repository.saveShipment(
              {
                ...shipment,
                status:
                  input.kind === "shipment.delivered" ? "delivered" : "shipped",
                tracking: input.tracking,
                carrier: input.carrier,
                labelUrl: input.labelUrl || shipment.labelUrl,
              },
              shipment.version,
            ))
          )
            throw conflict();
        } else if (
          input.kind === "ai.completed" ||
          input.kind === "ai.failed"
        ) {
          if (job.operation !== "ai.generate") throw conflict();
          await this.studio.complete(
            job.id,
            input.kind === "ai.completed",
            outputs,
          );
        } else if (
          input.kind === "invoice.issued" ||
          input.kind === "invoice.credit-issued"
        ) {
          const credit = input.kind === "invoice.credit-issued";
          if (job.operation !== (credit ? "invoice.credit" : "invoice.create"))
            throw conflict();
          await this.invoices.confirmed(
            job.id,
            credit,
            input.amountCents,
            input.providerReference ?? "",
            input.invoiceNumber ?? "",
            input.documentUrl ?? "",
          );
        } else if (input.kind === "payment.failed") {
          if (job.operation !== "payment.create") throw conflict();
          const payment = await this.repository.payment(job.id);
          if (!payment) {
            if (!(await this.studio.failPurchase(job.id, input.amountCents)))
              return;
          } else {
            if (payment.amountCents !== input.amountCents) throw conflict();
            if (payment.status !== "pending") return;
            const order = await this.orders.get(
              payment.storeId,
              payment.orderId,
            );
            await this.orders.cancel(
              payment.storeId,
              order.id,
              order.version,
              "payment-failed",
            );
            if (
              !(await this.repository.savePayment(
                { ...payment, status: "failed" },
                payment.version,
              ))
            )
              throw conflict();
          }
        } else if (input.kind === "refund.failed") {
          if (job.operation !== "payment.refund") throw conflict();
          const refund = await this.repository.refund(job.id);
          if (!refund)
            await this.studio.refundCredit(job.id, input.amountCents, false);
          else {
            const payment = await this.repository.payment(refund.paymentId);
            if (
              !payment ||
              payment.amountCents !== input.amountCents ||
              refund.status !== "received"
            )
              throw conflict("İade sonucu işlem veya tutarla eşleşmiyor.");
          }
        } else if (
          input.kind === "notification.sent" ||
          input.kind === "notification.failed"
        ) {
          if (job.operation !== "notification.send") throw conflict();
          await this.notifications.confirmed(
            input.referenceId,
            input.kind === "notification.sent",
          );
        } else {
          if (job.operation !== "payout.create") throw conflict();
          await this.finance.completeWithdrawal(
            input.referenceId,
            input.amountCents,
            input.kind === "payout.completed",
          );
        }
        if (input.kind !== "shipment.shipped")
          await this.jobs.complete(job.id, !input.kind.endsWith("failed"));
        await this.audit.append(
          "provider",
          job.scopeId,
          input.kind,
          input.referenceId,
        );
      },
    );
  }
  async reconcileProviderResult(id: string) {
    const job = await this.jobs.get(id);
    if (job.attempts === 0) return { checked: false, events: 0 };
    const result = await this.integrations.request(
      "events.pull",
      { referenceId: id },
      `reconcile:${randomUUID()}`,
    );
    let events = 0;
    for (const proof of result.events) {
      const raw = Buffer.from(proof.payload, "utf8");
      this.integrations.verify(raw, proof.timestamp, proof.signature);
      const original: unknown = JSON.parse(proof.payload),
        input = providerEventSchema.parse(original);
      if (input.referenceId !== id)
        throw conflict("Sorgulanan işlem ile sağlayıcı olayı eşleşmiyor.");
      await this.event(input, original);
      events++;
    }
    return { checked: true, events };
  }
  async reconcileProviderResults() {
    if (!this.integrations.status().configured) return;
    for (let index = 0; index < 3; index++) {
      const job = await this.jobs.reconciliationCandidate();
      if (!job) break;
      await this.reconcileProviderResult(job.id);
    }
  }
  async reconcile() {
    await this.wholesale.reconcile();
    for (const refund of await this.repository.compensations()) {
      const payment = await this.repository.payment(refund.paymentId);
      if (!payment) continue;
      const job = await this.jobs.get(payment.id);
      if (
        payment.providerReference ||
        (job.result && "providerReference" in job.result)
      ) {
        const providerReference =
          payment.providerReference ||
          (job.result && "providerReference" in job.result
            ? job.result.providerReference
            : "");
        await this.tx.run(() =>
          this.jobs.enqueue(
            refund.id,
            refund.storeId,
            payment.actorId,
            "payment.refund",
            {
              referenceId: refund.id,
              paymentReference: providerReference,
              amountCents: payment.amountCents,
              currency: "TRY",
            },
          ),
        );
      }
    }
    for (const order of await this.orders.settledReady())
      await this.tx.run(async () => {
        const latest = await this.orders.get(order.storeId, order.id);
        if (latest.financialState !== "pending" || latest.payment !== "paid")
          return;
        await this.finance.settle(
          latest.storeId,
          latest.id,
          latest.totalCents -
            commission(latest.totalCents, latest.commissionBasisPoints ?? 0),
        );
        await this.referrals.settled(
          (await this.stores.byId(latest.storeId)).ownerId,
          latest,
        );
        await this.orders.save(
          { ...latest, financialState: "settled" },
          latest.version,
        );
      });
  }
  async checkout(
    storeId: string,
    buyerId: string,
    id: string,
    hash: string,
    cartVersion: number,
    contact: Omit<OrderInput, "lines">,
  ) {
    const input = JSON.stringify({ hash, cartVersion, contact });
    return this.tx.run(async () => {
      const previous = await this.repository.checkout(id);
      if (previous) {
        if (
          previous.storeId !== storeId ||
          previous.buyerId !== buyerId ||
          previous.input !== input
        )
          throw conflict("Checkout kimliği farklı girdiyle kullanılmış.");
        return buyerOrderView(
          await this.orders.get(storeId, previous.orderId, buyerId),
        );
      }
      const cart = await this.engagement.rawCart(hash, storeId);
      if (
        cart.version !== cartVersion ||
        !cart.lines.length ||
        cart.lines.length > 30
      )
        throw conflict("Sepet değişmiş, boş veya 30 satır sınırını aşıyor.");
      const created = await this.orders.create(
        storeId,
        buyerId,
        id,
        {
          ...contact,
          lines: cart.lines.map((line) => ({
            ...line,
            variant: line.variant ?? "",
          })),
        },
        true,
      );
      await this.engagement.clear(hash, storeId, cartVersion);
      await this.repository.createCheckout({
        id,
        storeId,
        buyerId,
        orderId: created.id,
        input,
        createdAt: new Date(),
      });
      return created;
    });
  }
  async refundUnshipped(
    storeId: string,
    orderId: string,
    actorId: string,
    id: string,
    version: number,
    reason: string,
  ) {
    this.integrations.require();
    const initial = await this.orders.get(storeId, orderId),
      previous = await this.repository.orderRefund(orderId);
    if (previous) {
      if (previous.id !== id || previous.reason !== reason) throw conflict();
      return previous;
    }
    if (
      initial.version !== version ||
      initial.payment !== "paid" ||
      initial.shipment !== "preparing"
    )
      throw conflict(
        "Yalnız kargoya verilmemiş ödenen sipariş iptal edilebilir.",
      );
    const shipment = await this.repository.orderShipment(orderId);
    let confirmed = false;
    if (shipment) {
      const job = await this.jobs.get(shipment.id);
      if (job.attempts > 0) {
        const result = await this.integrations.request(
          "shipping.cancel",
          { referenceId: shipment.id },
          `cancel:${shipment.id}`,
        );
        if (!result.cancelled)
          throw conflict(
            "Gönderi iptali teyit edilemedi; iade akışını kullanın.",
          );
        confirmed = true;
      }
    }
    return this.tx.run(async () => {
      const old = await this.repository.orderRefund(orderId);
      if (old) {
        if (old.id !== id || old.reason !== reason) throw conflict();
        return old;
      }
      const order = await this.orders.get(storeId, orderId),
        payment = await this.repository.orderPayment(orderId);
      if (
        order.version !== version ||
        order.payment !== "paid" ||
        order.shipment !== "preparing" ||
        !payment?.providerReference
      )
        throw conflict();
      if (shipment) {
        const job = await this.jobs.get(shipment.id);
        await this.jobs.cancel(job.id, job.ownerId, confirmed);
      }
      await this.orders.save(
        { ...order, financialState: "refundPending" },
        order.version,
      );
      const refund = {
        id,
        storeId,
        orderId,
        buyerId: order.buyerId,
        paymentId: payment.id,
        reason,
        status: "received" as const,
        restock: true,
        settled: order.financialState === "settled",
        late: false,
        version: 0,
        createdAt: new Date(),
      };
      await this.repository.createRefund(refund);
      await this.jobs.enqueue(id, storeId, actorId, "payment.refund", {
        referenceId: id,
        paymentReference: payment.providerReference,
        amountCents: payment.amountCents,
        currency: "TRY",
      });
      await this.audit.append(actorId, storeId, "order.refund-request", id);
      return refund;
    });
  }
}
