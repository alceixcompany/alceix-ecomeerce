import { Inject, Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { CRM, type CrmRepository } from "./crm.repository";
import {
  customerView,
  defaultSettings,
  type CustomerInput,
  type CustomerQuery,
  type CrmSettings,
} from "../domain/customer";
import { conflict, notFound } from "../../../shared/errors";
import {
  communicationView,
  type CommunicationInput,
} from "../domain/communication";
@Injectable()
export class CrmService {
  constructor(@Inject(CRM) private readonly repository: CrmRepository) {}
  async list(storeId: string, query: CustomerQuery) {
    const result = await this.repository.list(storeId, query),
      settings = await this.settings(storeId);
    return {
      ...result,
      items: result.items.map((customer) =>
        customerView(customer, settings.settings.earnRate),
      ),
      limit: query.limit,
      metricsAvailable: true,
    };
  }
  async create(storeId: string, input: CustomerInput) {
    const now = new Date();
    const customer = {
      ...input,
      email: input.email.toLowerCase(),
      id: randomUUID(),
      storeId,
      version: 0,
      createdAt: now,
      updatedAt: now,
      consentUpdatedAt: now,
    };
    await this.repository.create(customer);
    await this.repository.refreshCustomer(storeId, customer.email);
    return customerView(
      (await this.repository.byEmail(storeId, customer.email))!,
    );
  }
  async update(
    storeId: string,
    id: string,
    version: number,
    input: CustomerInput,
  ) {
    const saved = await this.repository.update(storeId, id, version, {
      ...input,
      email: input.email.toLowerCase(),
    });
    if (!saved)
      throw conflict(
        "Müşteri bulunamadı veya başka bir oturumda değiştirildi. Listeyi yenileyin.",
      );
    await this.repository.refreshCustomer(storeId, saved.email);
    return customerView((await this.repository.byEmail(storeId, saved.email))!);
  }
  async recipients(storeId: string, segment: CommunicationInput["segment"]) {
    const result = await this.repository.recipients(storeId, segment);
    return {
      available: true,
      total: result.total,
      items: result.items.map((customer) => customerView(customer)),
    };
  }
  async communications(
    storeId: string,
    kind: CommunicationInput["kind"],
    page: number,
    limit: number,
  ) {
    const result = await this.repository.communications(
      storeId,
      kind,
      page,
      limit,
    );
    return { ...result, limit, items: result.items.map(communicationView) };
  }
  async createCommunication(
    storeId: string,
    requestId: string,
    input: CommunicationInput,
  ) {
    const previous = await this.repository.communicationByRequest(
      storeId,
      requestId,
    );
    const matches = (draft: CommunicationInput) =>
      draft.kind === input.kind &&
      draft.segment === input.segment &&
      draft.subject === input.subject &&
      draft.message === input.message;
    if (previous) {
      if (!matches(previous.initialInput ?? previous))
        throw conflict("İstek kimliği farklı bir taslak için kullanılmış.");
      return communicationView(previous);
    }
    const now = new Date(),
      draft = {
        ...input,
        id: randomUUID(),
        storeId,
        requestId,
        initialInput: { ...input },
        version: 0,
        createdAt: now,
        updatedAt: now,
      };
    if ((await this.repository.createCommunication(draft)) === "duplicate") {
      const existing = await this.repository.communicationByRequest(
        storeId,
        requestId,
      );
      if (!existing || !matches(existing.initialInput ?? existing))
        throw conflict();
      return communicationView(existing);
    }
    return communicationView(draft);
  }
  async updateCommunication(
    storeId: string,
    id: string,
    version: number,
    input: CommunicationInput,
  ) {
    const saved = await this.repository.updateCommunication(
      storeId,
      id,
      version,
      input,
    );
    if (!saved) throw conflict();
    return communicationView(saved);
  }
  async settings(storeId: string) {
    const saved = await this.repository.settings(storeId);
    return saved
      ? { settings: saved.settings, version: saved.version }
      : { settings: defaultSettings, version: 0 };
  }
  async saveSettings(storeId: string, version: number, settings: CrmSettings) {
    const saved = await this.repository.saveSettings(
      storeId,
      version,
      settings,
    );
    if (!saved) throw conflict();
    return { settings: saved.settings, version: saved.version };
  }
  recipientAfter(
    storeId: string,
    segment: CommunicationInput["segment"],
    afterId: string,
    before: Date,
  ) {
    return this.repository.recipientAfter(storeId, segment, afterId, before);
  }
  customer(storeId: string, id: string) {
    return this.repository.customer(storeId, id);
  }
  byEmail(storeId: string, email: string) {
    return this.repository.byEmail(storeId, email);
  }
  optOut(storeId: string, id: string, enabled: boolean) {
    return this.repository.optOut(storeId, id, enabled);
  }
  recipientPage(
    storeId: string,
    segment: CommunicationInput["segment"],
    page: number,
  ) {
    return this.repository.recipientPage(storeId, segment, page);
  }
  async draft(storeId: string, id: string) {
    const draft = await this.repository.draftById(storeId, id);
    if (!draft) throw notFound();
    return draft;
  }
  recordOrder(order: {
    id: string;
    storeId: string;
    email: string;
    version: number;
    payment: string;
    totalCents: number;
    createdAt: Date;
  }) {
    return this.repository.recordOrder({
      id: order.id,
      storeId: order.storeId,
      email: order.email.toLowerCase(),
      version: order.version,
      paid: order.payment === "paid",
      totalCents: order.totalCents,
      createdAt: order.createdAt,
    });
  }
  recordCart(
    storeId: string,
    metric: import("../domain/customer").CartMetricInput,
  ) {
    return this.repository.recordCart(storeId, metric);
  }
  clearCart(storeId: string, hash: string) {
    return this.repository.clearCart(storeId, hash);
  }
  abandonedCandidate() {
    return this.repository.abandonedCandidate();
  }
  markReminder(storeId: string, id: string, updatedAt: Date) {
    return this.repository.markReminder(storeId, id, updatedAt);
  }
  lockRecipient(storeId: string, id: string) {
    return this.repository.lockRecipient(storeId, id);
  }
}
