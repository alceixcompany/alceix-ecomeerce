import { NotificationsService } from "../../notifications/application/notifications.service";
import { JobsService } from "../../jobs/application/jobs.service";
import { AuditService } from "../../audit/application/audit.service";
import {
  TRANSACTIONS,
  type TransactionRunner,
} from "../../../shared/transactions";
import { conflict, notFound } from "../../../shared/errors";
import { Inject, Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import {
  CONTACT,
  type ContactRepository,
  type ContactInput,
} from "./contact.repository";
@Injectable()
export class ContactService {
  constructor(
    @Inject(CONTACT) private readonly repository: ContactRepository,
    private readonly notifications: NotificationsService,
    private readonly jobs: JobsService,
    private readonly audit: AuditService,
    @Inject(TRANSACTIONS) private readonly tx: TransactionRunner,
  ) {}
  list(page: number, limit: number) {
    return this.repository.list(page, limit);
  }
  async submit(input: ContactInput) {
    const submission = {
      ...input,
      email: input.email.toLowerCase(),
      id: randomUUID(),
      createdAt: new Date(),
      status: "pending" as const,
    };
    await this.repository.create(submission);
    return {
      id: submission.id,
      status: submission.status,
      message: "Talebiniz kaydedildi. Destek ekibinin incelemesini bekliyor.",
    };
  }
  async review(
    id: string,
    actorId: string,
    version: number,
    status: "pending" | "review" | "resolved",
    internalNote: string,
  ) {
    return this.tx.run(async () => {
      const saved = await this.repository.save(id, version, {
        status,
        internalNote,
      });
      if (!saved) throw conflict();
      await this.audit.append(actorId, "platform", "contact.review", id);
      return saved;
    });
  }
  async reply(
    id: string,
    actorId: string,
    requestId: string,
    version: number,
    subject: string,
    message: string,
  ) {
    return this.tx.run(async () => {
      const contact = await this.repository.find(id);
      if (!contact) throw notFound();
      // Immutable job input handles retries even after the queue record changes.
      let previous = null;
      try {
        previous = await this.jobs.get(requestId);
      } catch (error) {
        if (!(
          error &&
          typeof error === "object" &&
          "status" in error &&
          error.status === 404
        ))
          throw error;
      }
      if (!previous) {
        if (
          !(await this.repository.save(id, version, {
            status: "review",
            internalNote: contact.internalNote ?? "",
          }))
        )
          throw conflict();
      }
      const result = await this.notifications.transactional(
        `contact:${id}`,
        actorId,
        requestId,
        contact.email,
        subject,
        message,
      );
      await this.audit.append(
        actorId,
        "platform",
        "contact.reply-queued",
        requestId,
      );
      return result;
    });
  }
}
