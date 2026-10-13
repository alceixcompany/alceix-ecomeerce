import { CouponsService } from "../../coupons/application/coupons.service";
import { StoresService } from "../../stores/application/stores.service";
import { Inject, Injectable } from "@nestjs/common";
import { randomUUID, randomBytes, createHash } from "node:crypto";
import {
  NOTIFICATIONS,
  type NotificationsRepository,
} from "./notifications.repository";
import { CrmService } from "../../crm/application/crm.service";
import { UsersService } from "../../users/application/users.service";
import { JobsService } from "../../jobs/application/jobs.service";
import { IntegrationsService } from "../../integrations/application/integrations.service";
import {
  TRANSACTIONS,
  type TransactionRunner,
} from "../../../shared/transactions";
import { CONFIG, type AppConfig } from "../../../config/config";
import { conflict, notFound } from "../../../shared/errors";
@Injectable()
export class NotificationsService {
  constructor(
    @Inject(NOTIFICATIONS) private readonly repository: NotificationsRepository,
    private readonly crm: CrmService,
    private readonly coupons: CouponsService,
    private readonly stores: StoresService,
    private readonly users: UsersService,
    private readonly jobs: JobsService,
    private readonly integrations: IntegrationsService,
    @Inject(TRANSACTIONS) private readonly tx: TransactionRunner,
    @Inject(CONFIG) private readonly config: AppConfig,
  ) {}
  notify(
    userId: string,
    sourceId: string,
    title: string,
    text: string,
    url: string,
  ) {
    return this.repository.notify({
      id: randomUUID(),
      userId,
      sourceId,
      title,
      text,
      url,
      read: false,
      createdAt: new Date(),
    });
  }
  inbox(userId: string, page: number, limit: number) {
    return this.repository.inbox(userId, page, limit);
  }
  async read(userId: string, id: string) {
    if (!(await this.repository.read(userId, id))) throw notFound();
    return { read: true };
  }
  async sendDraft(
    storeId: string,
    actorId: string,
    id: string,
    draftId: string,
    version: number,
    channel: "email" | "sms" | "whatsapp" = "email",
  ) {
    this.integrations.require();
    return this.tx.run(async () => {
      const previous = await this.repository.batch(id);
      if (previous) {
        if (
          previous.storeId !== storeId ||
          previous.actorId !== actorId ||
          previous.draftId !== draftId ||
          previous.channel !== channel ||
          previous.draftVersion !== version
        )
          throw conflict();
        return previous;
      }
      const draft = await this.crm.draft(storeId, draftId);
      if (draft.version !== version) throw conflict();
      const batch = {
        id,
        storeId,
        draftId,
        draftVersion: version,
        actorId,
        subject: draft.subject,
        message: draft.message,
        channel,
        segment: draft.segment,
        cursor: "",
        status: "queued" as const,
        version: 0,
        createdAt: new Date(),
      };
      await this.repository.createBatch(batch);
      return batch;
    });
  }
  async batch(id: string, storeId: string) {
    const batch = await this.repository.batch(id);
    if (!batch || batch.storeId !== storeId) throw notFound();
    const { dispatchLock: _lock, ...view } = batch;
    return { ...view, counts: await this.repository.stats(id) };
  }
  async unsubscribe(token: string) {
    const record = await this.repository.token(
      createHash("sha256").update(token).digest("hex"),
    );
    if (!record) throw notFound();
    await this.tx.run(async () => {
      if (record.storeId === "platform")
        await this.users.revokeMarketing(record.customerId);
      else {
        await this.repository.saveSubscription({
          storeId: record.storeId,
          customerId: record.customerId,
          active: false,
        });
        await this.crm.optOut(record.storeId, record.customerId, false);
      }
    });
    return { message: "İletişim tercihi güncellendi." };
  }
  async preferences(storeId: string, userId: string, active: boolean) {
    const user = await this.users.findById(userId);
    if (!user?.emailVerifiedAt) throw conflict("E-posta doğrulanmalı.");
    const customer = await this.crm.byEmail(storeId, user.email);
    if (!customer) throw notFound();
    await this.tx.run(async () => {
      await this.repository.saveSubscription({
        storeId,
        customerId: customer.id,
        active,
      });
      await this.crm.optOut(storeId, customer.id, active);
    });
    return { active };
  }
  async produceOnce() {
    const candidate = await this.repository.nextBatch();
    if (!candidate) return;
    await this.tx.run(async () => {
      const batch = await this.repository.batch(candidate.id);
      if (!batch || !["queued", "producing"].includes(batch.status)) return;
      const recipients =
        batch.source === "platform"
          ? await this.users.marketingRecipients(
              batch.channel === "email" ? "email" : "sms",
              batch.recipients ?? [],
              batch.cursor,
              batch.createdAt,
            )
          : await this.crm.recipientAfter(
              batch.storeId,
              batch.segment,
              batch.cursor,
              batch.createdAt,
            );
      for (const customer of recipients) {
        const subscription = await this.repository.subscription(
          batch.storeId,
          customer.id,
        );
        if (subscription?.active === false) continue;
        const recipient =
          batch.channel === "email"
            ? customer.email
            : customer.phone.replace(/[ ()-]/g, "");
        if (batch.channel !== "email" && !/^\+?[0-9]{9,15}$/.test(recipient))
          continue;
        const id = randomUUID(),
          token = randomBytes(32).toString("hex");
        await this.repository.createToken({
          hash: createHash("sha256").update(token).digest("hex"),
          storeId: batch.storeId,
          customerId: customer.id,
        });
        await this.repository.createDelivery({
          id,
          batchId: batch.id,
          audience: batch.source === "platform" ? "platform" : "marketing",
          storeId: batch.storeId,
          customerId: customer.id,
          status: "queued",
          availableAt: new Date(),
          createdAt: new Date(),
        });
        await this.jobs.enqueue(
          id,
          batch.storeId,
          batch.actorId,
          "notification.send",
          {
            referenceId: id,
            channel: batch.channel,
            recipient,
            subject: batch.subject,
            message: batch.message,
            unsubscribeUrl: `${this.config.frontendOrigin}/iletisim-tercihleri?token=${token}`,
          },
        );
      }
      if (
        !(await this.repository.saveBatch(
          {
            ...batch,
            cursor: recipients.at(-1)?.id ?? batch.cursor,
            status: recipients.length === 100 ? "producing" : "enqueued",
          },
          batch.version,
        ))
      )
        throw conflict();
    });
  }

  async dispatchOnce() {
    const delivery = await this.repository.nextDelivery();
    if (!delivery) return;
    const claimed = await this.tx.run(async () => {
      const job = await this.jobs.get(delivery.id);
      if (job.status === "succeeded") {
        await this.repository.saveDelivery(job.id, "sent");
        return null;
      }
      const input = job.input,
        channel = "channel" in input ? input.channel : "email",
        recipient = "recipient" in input ? input.recipient : "";
      const customer =
        delivery.audience === "platform"
          ? await this.users.eligibleRecipient(delivery.customerId, channel)
          : await this.crm.customer(delivery.storeId, delivery.customerId);
      const subscription = await this.repository.subscription(
          delivery.storeId,
          delivery.customerId,
        ),
        batch = /^[a-f0-9-]{36}$/.test(delivery.batchId)
          ? await this.repository.batch(delivery.batchId)
          : null;
      const target =
        channel === "email"
          ? customer?.email
          : customer?.phone.replace(/[ ()-]/g, "");
      const invalid =
        batch?.status === "cancelled" ||
        (delivery.audience !== "transactional" &&
          (!customer?.consent ||
            subscription?.active === false ||
            target !== recipient));
      if (invalid) {
        if (!job.attempts && job.status === "queued") {
          await this.jobs.cancel(job.id, job.ownerId);
          await this.repository.saveDelivery(job.id, "skipped");
        } else if (job.status === "queued" || job.status === "failed") {
          await this.jobs.defer(job.id);
          await this.repository.saveDelivery(job.id, "awaiting");
        } else await this.repository.saveDelivery(job.id, "awaiting");
        return null;
      }
      if (batch && !(await this.repository.lockBatch(batch.id)))
        throw conflict();
      if (
        (delivery.audience === "platform" &&
          !(await this.users.lockRecipient(delivery.customerId, channel))) ||
        (delivery.audience !== "platform" &&
          delivery.audience !== "transactional" &&
          !(await this.crm.lockRecipient(
            delivery.storeId,
            delivery.customerId,
          )))
      )
        throw conflict();
      return this.jobs.claim(job.id);
    });
    // No network operation runs inside the MongoDB transaction.
    if (claimed) await this.jobs.dispatch(claimed);
    const current = await this.jobs.get(delivery.id);
    if (claimed)
      await this.repository.saveDelivery(
        delivery.id,
        current.status === "awaiting"
          ? "awaiting"
          : current.status === "succeeded"
            ? "sent"
            : current.status === "failed"
              ? "failed"
              : "queued",
        current.availableAt,
      );
  }
  async confirmed(id: string, success: boolean) {
    const delivery = await this.repository.delivery(id);
    if (!delivery) throw notFound();
    if (
      (delivery.status === "sent" && !success) ||
      (delivery.status === "failed" && success)
    )
      throw conflict("Çelişkili teslimat teyidi.");
    await this.repository.saveDelivery(id, success ? "sent" : "failed");
    await this.jobs.complete(id, success);
  }
  async automateOnce() {
    if (!this.integrations.status().configured) return;
    await this.tx.run(async () => {
      const candidate = await this.crm.abandonedCandidate();
      if (!candidate) return;
      const { customer, settings } = candidate;
      const subscription = await this.repository.subscription(
        customer.storeId,
        customer.id,
      );
      const buyer =
        customer.cartBuyerId &&
        (await this.users.findById(customer.cartBuyerId));
      if (
        subscription?.active === false ||
        !buyer ||
        !buyer.emailVerifiedAt ||
        buyer.email !== customer.email
      )
        return;
      const store = await this.stores.byId(customer.storeId);
      if (!store.isOpen || store.platformSuspended) {
        await this.crm.markReminder(
          customer.storeId,
          customer.id,
          customer.cartUpdatedAt!,
        );
        return;
      }
      if (
        !(await this.crm.markReminder(
          store.id,
          customer.id,
          customer.cartUpdatedAt!,
        ))
      )
        return;
      const id = randomUUID(),
        token = randomBytes(32).toString("hex");
      let code = "";
      if (settings.discount > 0) {
        code = "CART-" + id.slice(0, 8).toUpperCase();
        await this.coupons.save(store.id, {
          code,
          kind: "percent",
          amount: settings.discount,
          minimumCents: 0,
          limitUses: 1,
          expiresAt: new Date(Date.now() + 48 * 3600000),
          active: true,
          reusableAfterRefund: false,
          allowedBuyerId: buyer.id,
        });
      }
      await this.repository.createToken({
        hash: createHash("sha256").update(token).digest("hex"),
        storeId: store.id,
        customerId: customer.id,
      });
      await this.repository.createDelivery({
        id,
        batchId: `cart:${customer.id}`,
        storeId: store.id,
        customerId: customer.id,
        status: "queued",
        availableAt: new Date(),
        createdAt: new Date(),
      });
      await this.jobs.enqueue(
        id,
        store.id,
        store.ownerId,
        "notification.send",
        {
          referenceId: id,
          channel: "email",
          recipient: customer.email,
          subject: "Sepetiniz sizi bekliyor",
          message:
            settings.template.replaceAll("{{ad}}", customer.name) +
            (code ? ` İndirim kodunuz: ${code}.` : "") +
            ` ${this.config.frontendOrigin}/${store.slug}`,
          unsubscribeUrl: `${this.config.frontendOrigin}/iletisim-tercihleri?token=${token}`,
        },
      );
    });
  }

  async transactional(
    scopeId: string,
    actorId: string,
    id: string,
    recipient: string,
    subject: string,
    message: string,
  ) {
    this.integrations.require();
    const old = await this.repository.delivery(id);
    if (!old)
      await this.repository.createDelivery({
        id,
        batchId: `transactional:${scopeId}`,
        audience: "transactional",
        storeId: scopeId,
        customerId: "",
        status: "queued",
        availableAt: new Date(),
        createdAt: new Date(),
      });
    await this.jobs.enqueue(id, scopeId, actorId, "notification.send", {
      referenceId: id,
      channel: "email",
      recipient,
      subject,
      message,
      unsubscribeUrl: "",
    });
    return { id, status: "queued" };
  }
  async platformSend(
    actorId: string,
    id: string,
    channel: "email" | "sms",
    input: { subject: string; message: string; recipients: string[] },
  ) {
    this.integrations.require();
    return this.tx.run(async () => {
      const old = await this.repository.batch(id);
      const recipients = [...input.recipients].sort();
      if (old) {
        if (
          old.actorId !== actorId ||
          old.storeId !== "platform" ||
          old.channel !== channel ||
          old.subject !== input.subject ||
          old.message !== input.message ||
          JSON.stringify(old.recipients) !== JSON.stringify(recipients)
        )
          throw conflict();
        return old;
      }
      const batch = {
        ...input,
        recipients,
        id,
        storeId: "platform",
        source: "platform" as const,
        draftId: "",
        actorId,
        channel,
        segment: "all" as const,
        cursor: "",
        status: "queued" as const,
        version: 0,
        createdAt: new Date(),
      };
      await this.repository.createBatch(batch);
      return batch;
    });
  }
  async cancelBatch(
    id: string,
    scopeId: string,
    version: number,
    channel?: "email" | "sms",
  ) {
    return this.tx.run(async () => {
      const batch = await this.repository.batch(id);
      if (
        !batch ||
        batch.storeId !== scopeId ||
        (channel && batch.channel !== channel)
      )
        throw notFound();
      if (batch.status === "cancelled") return { cancelled: true };
      if (
        !(await this.repository.saveBatch(
          { ...batch, status: "cancelled" },
          version,
        ))
      )
        throw conflict();
      return { cancelled: true };
    });
  }
}
