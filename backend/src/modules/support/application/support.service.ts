import { UsersService } from "../../users/application/users.service";
import { AuditService } from "../../audit/application/audit.service";
import {
  TRANSACTIONS,
  type TransactionRunner,
} from "../../../shared/transactions";
import { Inject, Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { SUPPORT, type SupportRepository } from "./support.repository";
import {
  ticketView,
  type Ticket,
  type TicketInput,
  type TicketQuery,
  type TicketStatus,
} from "../domain/ticket";
import { AppError, conflict, notFound } from "../../../shared/errors";
import type { Actor } from "../../../shared/http";
import { AttachmentsService } from "./attachments.service";
@Injectable()
export class SupportService {
  constructor(
    @Inject(SUPPORT) private readonly repository: SupportRepository,
    private readonly attachments: AttachmentsService,
    private readonly users: UsersService,
    private readonly audit: AuditService,
    @Inject(TRANSACTIONS) private readonly tx: TransactionRunner,
  ) {}
  async list(storeId: string, query: TicketQuery) {
    const result = await this.repository.list(storeId, query);
    return {
      ...result,
      items: result.items.map(ticketView),
      limit: query.limit,
    };
  }
  async platformList(query: Omit<TicketQuery, "channel">) {
    const result = await this.repository.list(undefined, {
      ...query,
      channel: "platform",
    });
    return {
      ...result,
      limit: query.limit,
      items: result.items.map((ticket) => ({
        ...ticketView(ticket),
        storeId: ticket.storeId,
        scopeKind: ticket.scopeKind ?? "store",
        assignedTo: ticket.assignedTo ?? "",
        internalNote: ticket.internalNote ?? "",
      })),
    };
  }
  async platformTicket(storeId: string, id: string) {
    const ticket = await this.get(storeId, id);
    if (ticket.channel !== "platform") throw notFound();
    return {
      ...ticketView(ticket),
      storeId: ticket.storeId,
      assignedTo: ticket.assignedTo ?? "",
      internalNote: ticket.internalNote ?? "",
    };
  }
  async platformAttachment(storeId: string, id: string, fileId: string) {
    const ticket = await this.platformTicket(storeId, id);
    if (
      !ticket.messages.some((message) =>
        message.attachments.some((file) => file.id === fileId),
      )
    )
      throw notFound();
    return this.attachments.read(storeId, fileId);
  }
  async create(
    storeId: string,
    input: TicketInput,
    actor: Actor,
    buyerId?: string,
    scopeKind: "store" | "partner" = "store",
  ) {
    const now = new Date();
    const ticket: Ticket = {
      id: randomUUID(),
      storeId,
      scopeKind,
      buyerId,
      version: 0,
      channel: input.channel,
      category: input.category,
      subject: input.subject,
      priority: input.priority,
      status: "open",
      requester: actor.name,
      createdAt: now,
      updatedAt: now,
      messages: [
        {
          id: randomUUID(),
          author: buyerId ? "customer" : "merchant",
          actorId: actor.id,
          name: actor.name,
          text: input.text,
          createdAt: now,
          attachments: [],
        },
      ],
    };
    await this.repository.create(ticket);
    return ticketView(ticket);
  }
  async get(storeId: string, id: string) {
    const ticket = await this.repository.find(storeId, id);
    if (!ticket) throw notFound();
    return ticket;
  }
  async reply(
    storeId: string,
    id: string,
    version: number,
    messageId: string,
    text: string,
    actor: Actor,
    author: "merchant" | "support" | "customer" = "merchant",
    attachmentIds: string[] = [],
  ) {
    const ticket = await this.get(storeId, id);
    const previous = ticket.messages.find((m) => m.id === messageId);
    if (previous) {
      if (
        previous.text !== text ||
        previous.author !== author ||
        previous.actorId !== actor.id ||
        JSON.stringify(previous.attachments.map((a) => a.id)) !==
          JSON.stringify(attachmentIds)
      )
        throw conflict("İstek kimliği başka bir yanıt için kullanılmış.");
      return ticketView(ticket);
    }
    if (ticket.version !== version) throw conflict();
    if (ticket.status === "resolved")
      throw conflict("Kapalı talebi yanıtlamadan önce yeniden açın.");
    if (ticket.messages.length >= 100)
      throw new AppError(
        422,
        "MESSAGE_LIMIT",
        "Mesaj sınırına ulaşıldı. Yeni bir destek talebi açın.",
      );
    const attachments = await this.attachments.resolve(
      storeId,
      attachmentIds,
      author === "customer" ? actor.id : undefined,
    );
    const now = new Date();
    return this.tx.run(async () => {
      const saved = await this.repository.save(
        {
          ...ticket,
          updatedAt: now,
          status: author === "support" ? "waiting" : "open",
          messages: [
            ...ticket.messages,
            {
              id: messageId,
              author,
              actorId: actor.id,
              name: actor.name,
              text,
              createdAt: now,
              attachments,
            },
          ],
        },
        version,
      );
      if (!saved) throw conflict();
      await this.repository.clearMatchingDraft(
        storeId,
        id,
        actor.id,
        text,
        attachmentIds,
      );
      return ticketView(saved);
    });
  }
  async draft(storeId: string, id: string, userId: string) {
    await this.get(storeId, id);
    const draft = await this.repository.draft(storeId, id, userId);
    return {
      text: draft?.text ?? "",
      version: draft?.version ?? 0,
      attachments: await this.attachments.resolve(
        storeId,
        draft?.attachmentIds ?? [],
      ),
    };
  }
  async saveDraft(
    storeId: string,
    id: string,
    userId: string,
    version: number,
    text: string,
    attachmentIds: string[],
  ) {
    await this.get(storeId, id);
    const files = await this.attachments.resolve(storeId, attachmentIds);
    const saved = await this.repository.saveDraft({
      storeId,
      ticketId: id,
      userId,
      version,
      text,
      attachmentIds,
      updatedAt: new Date(),
    });
    if (!saved) throw conflict();
    return { text: saved.text, version: saved.version, attachments: files };
  }
  async status(
    storeId: string,
    id: string,
    version: number,
    status: TicketStatus,
  ) {
    const ticket = await this.get(storeId, id);
    if (ticket.version !== version) throw conflict();
    const saved = await this.repository.save(
      { ...ticket, status, updatedAt: new Date() },
      version,
    );
    if (!saved) throw conflict();
    return ticketView(saved);
  }
  async buyerTicket(storeId: string, id: string, buyerId: string) {
    const ticket = await this.get(storeId, id);
    if (ticket.channel !== "customer" || ticket.buyerId !== buyerId)
      throw notFound();
    return ticketView(ticket);
  }
  async buyerList(storeId: string, buyerId: string, query: TicketQuery) {
    const result = await this.repository.list(
      storeId,
      { ...query, channel: "customer" },
      buyerId,
    );
    return { ...result, items: result.items.map(ticketView) };
  }
  async buyerReply(
    storeId: string,
    id: string,
    buyerId: string,
    version: number,
    messageId: string,
    text: string,
    actor: Actor,
    attachmentIds: string[],
  ) {
    await this.buyerTicket(storeId, id, buyerId);
    return this.reply(
      storeId,
      id,
      version,
      messageId,
      text,
      actor,
      "customer",
      attachmentIds,
    );
  }
  async buyerAttachment(
    storeId: string,
    id: string,
    buyerId: string,
    fileId: string,
  ) {
    const ticket = await this.buyerTicket(storeId, id, buyerId);
    if (
      !ticket.messages.some((m) =>
        m.attachments.some((file) => file.id === fileId),
      )
    )
      throw notFound();
    return this.attachments.read(storeId, fileId);
  }
  async review(
    storeId: string,
    id: string,
    actorId: string,
    version: number,
    input: {
      assignedTo: string;
      internalNote: string;
      priority: "normal" | "high";
    },
  ) {
    return this.tx.run(async () => {
      const ticket = await this.get(storeId, id);
      if (ticket.channel !== "platform") throw notFound();
      if (input.assignedTo)
        await this.users.requirePlatformAccess(input.assignedTo, "support");
      if (
        !(await this.repository.save(
          { ...ticket, ...input, updatedAt: new Date() },
          version,
        ))
      )
        throw conflict();
      await this.audit.append(actorId, storeId, "support.review", id);
      return this.platformTicket(storeId, id);
    });
  }
}
