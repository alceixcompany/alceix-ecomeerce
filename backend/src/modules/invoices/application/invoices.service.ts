import { Inject, Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { INVOICES, type InvoicesRepository } from "./invoices.repository";
import type { SellerInput, Invoice } from "../domain/invoice";
import { OrdersService } from "../../orders/application/orders.service";
import { JobsService } from "../../jobs/application/jobs.service";
import { IntegrationsService } from "../../integrations/application/integrations.service";
import { AuditService } from "../../audit/application/audit.service";
import {
  TRANSACTIONS,
  type TransactionRunner,
} from "../../../shared/transactions";
import { conflict, notFound, unavailable } from "../../../shared/errors";
@Injectable()
export class InvoicesService {
  constructor(
    @Inject(INVOICES) private readonly repository: InvoicesRepository,
    private readonly orders: OrdersService,
    private readonly jobs: JobsService,
    private readonly integrations: IntegrationsService,
    private readonly audit: AuditService,
    @Inject(TRANSACTIONS) private readonly tx: TransactionRunner,
  ) {}
  seller(storeId: string) {
    return this.repository.seller(storeId);
  }
  saveSeller(
    storeId: string,
    actorId: string,
    version: number,
    input: SellerInput,
  ) {
    return this.tx.run(async () => {
      const saved = await this.repository.saveSeller(
        { ...input, storeId, version },
        version,
      );
      if (!saved) throw conflict();
      await this.audit.append(
        actorId,
        storeId,
        "invoice.seller-settings",
        storeId,
      );
      return saved;
    });
  }
  async request(storeId: string, orderId: string, actorId: string, id: string) {
    this.integrations.require();
    return this.tx.run(async () => {
      const order = await this.orders.get(storeId, orderId),
        previous = await this.repository.order(orderId);
      if (previous) return this.view(previous);
      if (!["paid", "refunded"].includes(order.payment))
        throw conflict("Doğrulanmış ödeme olmadan fatura hazırlanamaz.");
      const seller = await this.repository.seller(storeId);
      if (!seller)
        throw unavailable(
          "Yasal satıcı bilgileri ve KDV politikası tamamlanmalı.",
        );
      const {
        storeId: _scope,
        version: sellerVersion,
        ...sellerInput
      } = seller;
      const invoice: Invoice = {
        id,
        storeId,
        orderId,
        actorId,
        amountCents: order.totalCents,
        status: "requested",
        refunded: order.payment === "refunded",
        providerReference: "",
        number: "",
        documentUrl: "",
        creditJobId: "",
        creditDocumentUrl: "",
        version: 0,
        createdAt: new Date(),
      };
      await this.repository.create(invoice);
      await this.jobs.enqueue(id, storeId, actorId, "invoice.create", {
        referenceId: id,
        orderId,
        currency: "TRY",
        amountCents: order.totalCents,
        seller: sellerInput,
        sellerVersion,
        buyer: {
          name: order.customer,
          email: order.email,
          city: order.city,
          address: order.address,
        },
        lines: order.items.map((item) => ({
          name: item.name,
          sku: item.sku,
          quantity: item.quantity,
          grossUnitCents: item.unitCents,
        })),
        discountCents: order.discountCents,
        shippingCents: order.shippingCents,
        pricesIncludeVat: true,
      });
      await this.audit.append(actorId, storeId, "invoice.request", id);
      return this.view(invoice);
    });
  }
  private view({
    actorId: _actor,
    providerReference: _provider,
    storeId: _scope,
    ...invoice
  }: Invoice) {
    return invoice;
  }
  async order(storeId: string, orderId: string, buyerId?: string) {
    await this.orders.get(storeId, orderId, buyerId);
    const invoice = await this.repository.order(orderId);
    return invoice ? this.view(invoice) : null;
  }
  async refunded(orderId: string) {
    const invoice = await this.repository.order(orderId);
    if (!invoice || invoice.refunded) return;
    const saved = await this.repository.save(
      { ...invoice, refunded: true },
      invoice.version,
    );
    if (!saved) throw conflict();
    await this.queueCredit(saved);
  }
  private async queueCredit(invoice: Invoice) {
    if (!invoice.refunded || invoice.status !== "issued" || invoice.creditJobId)
      return;
    const creditJobId = randomUUID(),
      saved = await this.repository.save(
        { ...invoice, creditJobId },
        invoice.version,
      );
    if (!saved) throw conflict();
    await this.jobs.enqueue(
      creditJobId,
      invoice.storeId,
      invoice.actorId,
      "invoice.credit",
      {
        referenceId: creditJobId,
        invoiceReference: invoice.providerReference,
        amountCents: invoice.amountCents,
        currency: "TRY",
      },
    );
  }
  async confirmed(
    id: string,
    credit: boolean,
    amountCents: number,
    providerReference: string,
    number: string,
    documentUrl: string,
  ) {
    const invoice = credit
      ? await this.repository.credit(id)
      : await this.repository.find(id);
    if (!invoice) throw notFound();
    if (
      invoice.amountCents !== amountCents ||
      !providerReference ||
      !number ||
      !documentUrl
    )
      throw conflict("Fatura sağlayıcı teyidi eksik veya tutarı farklı.");
    if (credit) {
      if (invoice.status === "credited") {
        if (invoice.creditDocumentUrl !== documentUrl) throw conflict();
        return;
      }
      if (invoice.status !== "issued" || !invoice.refunded) throw conflict();
      if (
        !(await this.repository.save(
          { ...invoice, status: "credited", creditDocumentUrl: documentUrl },
          invoice.version,
        ))
      )
        throw conflict();
    } else {
      if (invoice.status !== "requested") {
        if (
          invoice.providerReference !== providerReference ||
          invoice.number !== number ||
          invoice.documentUrl !== documentUrl
        )
          throw conflict();
        return;
      }
      const saved = await this.repository.save(
        {
          ...invoice,
          status: "issued",
          providerReference,
          number,
          documentUrl,
        },
        invoice.version,
      );
      if (!saved) throw conflict();
      await this.queueCredit(saved);
    }
  }
}
