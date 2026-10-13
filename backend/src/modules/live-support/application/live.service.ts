import { Inject, Injectable } from "@nestjs/common";
import { LIVE_SUPPORT, type LiveRepository } from "./live.repository";
import { UsersService } from "../../users/application/users.service";
import { StoresService } from "../../stores/application/stores.service";
import { PartnersService } from "../../partners/application/partners.service";
import { AuditService } from "../../audit/application/audit.service";
import {
  TRANSACTIONS,
  type TransactionRunner,
} from "../../../shared/transactions";
import { conflict, notFound } from "../../../shared/errors";
import type { LiveSession } from "../domain/live-session";
import type { PageQuery } from "../../../shared/page";
@Injectable()
export class LiveSupportService {
  constructor(
    @Inject(LIVE_SUPPORT) private readonly repository: LiveRepository,
    private readonly users: UsersService,
    private readonly stores: StoresService,
    private readonly partners: PartnersService,
    private readonly audit: AuditService,
    @Inject(TRANSACTIONS) private readonly tx: TransactionRunner,
  ) {}
  async create(
    userId: string,
    id: string,
    source: LiveSession["source"],
    sourceId: string,
    subject: string,
  ) {
    return this.tx.run(async () => {
      await this.users.lock(userId);
      const previous = await this.repository.find(id);
      if (previous) {
        if (
          previous.userId !== userId ||
          previous.source !== source ||
          previous.sourceId !== sourceId ||
          previous.subject !== subject
        )
          throw conflict();
        return this.view(previous);
      }
      if (source === "store") {
        const store = await this.stores.byId(sourceId);
        await this.stores.owned(store.slug, userId, "support-write");
      } else if (source !== "buyer") {
        const partner = await this.partners.access(
          sourceId,
          userId,
          "support-write",
        );
        if (partner.kind !== (source === "creator" ? "influencer" : "supplier"))
          throw notFound();
      } else if (sourceId) throw conflict();
      if ((await this.repository.activeCount(userId)) >= 3)
        throw conflict("En fazla üç açık canlı destek oturumu olabilir.");
      const user = await this.users.findById(userId);
      if (!user) throw notFound();
      const now = new Date(),
        session: LiveSession = {
          id,
          userId,
          name: user.name,
          source,
          sourceId,
          subject,
          status: "waiting",
          assignedTo: "",
          version: 0,
          createdAt: now,
          updatedAt: now,
          messages: 0,
        };
      await this.repository.create(session);
      return this.view(session);
    });
  }
  private view({ userId: _u, assignedTo: _a, ...session }: LiveSession) {
    return session;
  }
  async list(query: PageQuery, userId?: string) {
    const result = await this.repository.list(query, userId);
    return userId
      ? { ...result, items: result.items.map((session) => this.view(session)) }
      : result;
  }
  private async access(
    id: string,
    actorId: string,
    staff: boolean,
    write = false,
  ) {
    const session = await this.repository.find(id);
    if (!session) throw notFound();
    if (staff) await this.users.requirePlatformAccess(actorId, "live", write);
    else if (session.userId !== actorId) throw notFound();
    return session;
  }
  async get(id: string, actorId: string, staff: boolean) {
    const session = await this.access(id, actorId, staff);
    return staff ? session : this.view(session);
  }
  async messages(
    id: string,
    actorId: string,
    staff: boolean,
    query: PageQuery,
  ) {
    await this.access(id, actorId, staff);
    return this.repository.messages(id, query);
  }
  async reply(
    id: string,
    actorId: string,
    staff: boolean,
    messageId: string,
    text: string,
  ) {
    return this.tx.run(async () => {
      const session = await this.access(id, actorId, staff, true),
        old = await this.repository.message(messageId);
      if (old) {
        if (
          old.sessionId !== id ||
          old.actorId !== actorId ||
          old.text !== text
        )
          throw conflict();
        const { actorId: _actor, ...message } = old;
        return message;
      }
      if (session.status === "closed" || session.messages >= 1000)
        throw conflict("Oturum kapalı veya mesaj sınırına ulaştı.");
      if (staff && session.assignedTo && session.assignedTo !== actorId)
        throw conflict("Önce oturum atamasını güncelleyin.");
      const user = await this.users.findById(actorId);
      if (!user) throw notFound();
      if (
        !(await this.repository.save(
          {
            ...session,
            status: staff ? "active" : session.status,
            assignedTo: staff ? actorId : session.assignedTo,
            updatedAt: new Date(),
            messages: session.messages + 1,
          },
          session.version,
        ))
      )
        throw conflict();
      const message = {
        id: messageId,
        sessionId: id,
        actorId,
        sender: staff ? ("support" as const) : ("customer" as const),
        name: user.name,
        text,
        createdAt: new Date(),
      };
      await this.repository.append(message);
      const { actorId: _actor, ...view } = message;
      return view;
    });
  }
  async close(id: string, actorId: string, staff: boolean, version: number) {
    return this.tx.run(async () => {
      const session = await this.access(id, actorId, staff, true);
      if (session.status === "closed") return { closed: true };
      if (
        !(await this.repository.save(
          { ...session, status: "closed", updatedAt: new Date() },
          version,
        ))
      )
        throw conflict();
      await this.audit.append(actorId, "platform", "live.closed", id);
      return { closed: true };
    });
  }
  async assign(
    id: string,
    actorId: string,
    version: number,
    assignedTo: string,
  ) {
    return this.tx.run(async () => {
      const session = await this.access(id, actorId, true, true);
      if (session.status === "closed") throw conflict();
      if (assignedTo)
        await this.users.requirePlatformAccess(assignedTo, "live", true);
      const saved = await this.repository.save(
        {
          ...session,
          assignedTo,
          status: assignedTo ? "active" : "waiting",
          updatedAt: new Date(),
        },
        version,
      );
      if (!saved) throw conflict();
      await this.audit.append(actorId, "platform", "live.assigned", id);
      return saved;
    });
  }
}
