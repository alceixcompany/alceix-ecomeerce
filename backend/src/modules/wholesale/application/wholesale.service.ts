import { Inject, Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { WHOLESALE, type WholesaleRepository } from "./wholesale.repository";
import { PartnersService } from "../../partners/application/partners.service";
import { CollaborationService } from "../../collaboration/application/collaboration.service";
import { FinanceService } from "../../finance/application/finance.service";
import { JobsService } from "../../jobs/application/jobs.service";
import { IntegrationsService } from "../../integrations/application/integrations.service";
import { CatalogService } from "../../catalog/application/catalog.service";
import { MediaService } from "../../media/application/media.service";
import { AuditService } from "../../audit/application/audit.service";
import {
  TRANSACTIONS,
  type TransactionRunner,
} from "../../../shared/transactions";
import { conflict, notFound } from "../../../shared/errors";
import type { PageQuery } from "../../../shared/page";
@Injectable()
export class WholesaleService {
  constructor(
    @Inject(WHOLESALE) private readonly repository: WholesaleRepository,
    private readonly partners: PartnersService,
    private readonly collaboration: CollaborationService,
    private readonly finance: FinanceService,
    private readonly jobs: JobsService,
    private readonly integrations: IntegrationsService,
    private readonly catalog: CatalogService,
    private readonly media: MediaService,
    private readonly audit: AuditService,
    @Inject(TRANSACTIONS) private readonly tx: TransactionRunner,
  ) {}
  list(scope: { storeId?: string; partnerId?: string }, query: PageQuery) {
    return this.repository.list(scope, query);
  }
  async get(id: string, scope: { storeId?: string; partnerId?: string }) {
    const order = await this.repository.find(id);
    if (
      !order ||
      (scope.storeId && order.storeId !== scope.storeId) ||
      (scope.partnerId && order.partnerId !== scope.partnerId)
    )
      throw notFound();
    return order;
  }
  async create(
    storeId: string,
    actorId: string,
    id: string,
    partnerId: string,
    productId: string,
    quantity: number,
    maxTotalCents: number,
    contact: { address: string; city: string; phone: string; customer: string },
  ) {
    return this.tx.run(async () => {
      const previous = await this.repository.find(id);
      if (previous) {
        if (
          previous.storeId !== storeId ||
          previous.actorId !== actorId ||
          previous.partnerId !== partnerId ||
          previous.productId !== productId ||
          previous.quantity !== quantity ||
          previous.maxTotalCents !== maxTotalCents ||
          previous.address !== contact.address ||
          previous.city !== contact.city ||
          previous.phone !== contact.phone ||
          previous.customer !== contact.customer
        )
          throw conflict();
        return previous;
      }
      await this.collaboration.active(storeId, partnerId);
      const policy = await this.finance.requiredPolicy(storeId),
        product = await this.partners.reserve(partnerId, productId, quantity),
        totalCents = product.priceCents * quantity;
      if (
        !Number.isSafeInteger(totalCents) ||
        totalCents < 1 ||
        totalCents > 9999999999 ||
        totalCents > maxTotalCents
      )
        throw conflict();
      await this.finance.fund(storeId, `wholesale:${id}`, totalCents);
      const order = {
        ...contact,
        id,
        storeId,
        partnerId,
        productId,
        actorId,
        quantity,
        maxTotalCents,
        unitCents: product.priceCents,
        totalCents,
        sku: product.sku,
        name: product.name,
        image: product.images[0] ?? "",
        status: "preparing" as const,
        shipmentId: "",
        tracking: "",
        commissionBasisPoints: policy.commissionBasisPoints!,
        returnDays: policy.returnDays!,
        settled: false,
        version: 0,
        createdAt: new Date(),
      };
      await this.repository.create(order);
      await this.audit.append(actorId, storeId, "wholesale.create", id);
      return order;
    });
  }
  async cancel(
    id: string,
    scope: { storeId?: string; partnerId?: string },
    actorId: string,
    version: number,
  ) {
    const initial = await this.get(id, scope);
    if (initial.status === "cancelled") return initial;
    if (initial.status !== "preparing" || initial.version !== version)
      throw conflict();
    let confirmed = false;
    const dispatch = initial.shipmentId
      ? await this.jobs.get(initial.shipmentId)
      : null;
    if (dispatch && dispatch.attempts > 0) {
      const response = await this.integrations.request(
        "shipping.cancel",
        { referenceId: initial.shipmentId },
        `cancel:${initial.shipmentId}`,
      );
      if (!response.cancelled)
        throw conflict("Sağlayıcı gönderiyi iptal edemedi.");
      confirmed = true;
    }
    return this.tx.run(async () => {
      const order = await this.get(id, scope);
      if (order.status === "cancelled") return order;
      if (order.status !== "preparing") throw conflict();
      if (order.shipmentId) {
        const job = await this.jobs.get(order.shipmentId);
        await this.jobs.cancel(job.id, job.ownerId, confirmed);
      }
      await this.partners.release(
        order.partnerId,
        order.productId,
        order.quantity,
      );
      await this.finance.unfund(
        order.storeId,
        `wholesale:${order.id}`,
        order.totalCents,
      );
      const saved = await this.repository.save(
        { ...order, status: "cancelled" },
        version,
      );
      if (!saved) throw conflict();
      await this.audit.append(actorId, order.storeId, "wholesale.cancel", id);
      return saved;
    });
  }
  async ship(
    id: string,
    partnerId: string,
    actorId: string,
    shipmentId: string,
    carrier: string,
  ) {
    this.integrations.require();
    return this.tx.run(async () => {
      const order = await this.get(id, { partnerId });
      if (order.shipmentId) return order;
      if (order.status !== "preparing") throw conflict();
      const saved = await this.repository.save(
        { ...order, shipmentId },
        order.version,
      );
      if (!saved) throw conflict();
      await this.jobs.enqueue(
        shipmentId,
        partnerId,
        actorId,
        "shipping.create",
        {
          referenceId: shipmentId,
          shipperScopeId: partnerId,
          orderId: id,
          carrier,
          city: order.city,
          address: order.address,
          customer: order.customer,
          phone: order.phone,
          items: [{ sku: order.sku, quantity: order.quantity }],
        },
      );
      return saved;
    });
  }
  async providerShipment(
    shipmentId: string,
    tracking: string,
    delivered: boolean,
  ) {
    const order = await this.repository.shipment(shipmentId);
    if (!order) throw notFound();
    if (order.tracking && order.tracking !== tracking) throw conflict();
    if (order.status === "cancelled") throw conflict();
    if (order.status === "delivered") return order;
    if (order.status === "preparing")
      await this.partners.consume(
        order.partnerId,
        order.productId,
        order.quantity,
      );
    const saved = await this.repository.save(
      {
        ...order,
        status: delivered ? "delivered" : "shipped",
        tracking,
        ...(delivered
          ? { settleAt: new Date(Date.now() + order.returnDays * 86400000) }
          : {}),
      },
      order.version,
    );
    if (!saved) throw conflict();
    return saved;
  }
  async import(
    storeId: string,
    actorId: string,
    id: string,
    partnerId: string,
    productId: string,
    priceCents: number,
  ) {
    const previous = await this.repository.importReceipt(id);
    if (previous) {
      if (
        previous.storeId !== storeId ||
        previous.partnerId !== partnerId ||
        previous.productId !== productId ||
        previous.priceCents !== priceCents
      )
        throw conflict();
      return this.catalog.product(storeId, previous.retailProductId);
    }
    await this.collaboration.active(storeId, partnerId);
    const source = await this.partners.product(partnerId, productId);
    if (!source.active) throw conflict();
    const images = await this.media.copyProduct(
      partnerId,
      storeId,
      source.images,
    );
    return this.tx.run(async () => {
      const old = await this.repository.importReceipt(id);
      if (old) {
        if (
          old.storeId !== storeId ||
          old.partnerId !== partnerId ||
          old.productId !== productId ||
          old.priceCents !== priceCents
        )
          throw conflict();
        return this.catalog.product(storeId, old.retailProductId);
      }
      await this.collaboration.active(storeId, partnerId);
      const product = await this.catalog.create(storeId, {
        name: source.name.slice(0, 120),
        sku: `SUP-${source.sku.slice(0, 32)}-${randomUUID().slice(0, 8)}`,
        category: source.category.slice(0, 40) || "Tedarik",
        description: source.description,
        barcode: "",
        priceCents,
        costCents: source.priceCents,
        currency: "TRY",
        stock: 0,
        variants: [],
        images,
        status: "draft",
        model: "supplier",
        seoTitle: source.name.slice(0, 70),
        seoDescription: "",
      });
      await this.repository.createImport({
        id,
        storeId,
        partnerId,
        productId,
        priceCents,
        retailProductId: product.id,
      });
      await this.audit.append(actorId, storeId, "supply.import", product.id);
      return product;
    });
  }
  async reconcile() {
    for (const candidate of await this.repository.ready())
      await this.tx.run(async () => {
        const order = await this.repository.find(candidate.id);
        if (!order || order.settled || order.status !== "delivered") return;
        await this.finance.settleSupply(
          order.storeId,
          order.partnerId,
          `wholesale:${order.id}`,
          order.totalCents,
          order.commissionBasisPoints,
        );
        if (
          !(await this.repository.save(
            { ...order, settled: true },
            order.version,
          ))
        )
          throw conflict();
      });
  }
}
