import { Inject, Injectable, type OnModuleInit } from "@nestjs/common";
import { Schema, type Connection, type Model } from "mongoose";
import { DATABASE, MongoTransactions } from "../../../infrastructure/database";
import type { LiveRepository } from "../application/live.repository";
import type { LiveSession, LiveMessage } from "../domain/live-session";
import { literalSearch, type PageQuery } from "../../../shared/page";
@Injectable()
export class MongoLiveRepository implements LiveRepository, OnModuleInit {
  private readonly sessions: Model<LiveSession>;
  private readonly chat: Model<LiveMessage>;
  constructor(
    @Inject(DATABASE) db: Connection,
    private readonly tx: MongoTransactions,
  ) {
    const session = new Schema<LiveSession>(
      {
        id: { type: String, unique: true },
        userId: String,
        name: String,
        source: String,
        sourceId: String,
        subject: String,
        status: String,
        assignedTo: String,
        version: Number,
        createdAt: Date,
        updatedAt: Date,
        messages: Number,
      },
      { versionKey: false },
    );
    session.index({ userId: 1, status: 1, updatedAt: -1, id: 1 });
    session.index({ status: 1, updatedAt: -1, id: 1 });
    this.sessions = db.model<LiveSession>("LiveSession", session);
    const message = new Schema<LiveMessage>(
      {
        id: { type: String, unique: true },
        sessionId: String,
        actorId: String,
        sender: String,
        name: String,
        text: String,
        createdAt: Date,
      },
      { versionKey: false },
    );
    message.index({ sessionId: 1, createdAt: 1, id: 1 });
    this.chat = db.model<LiveMessage>("LiveMessage", message);
  }
  async onModuleInit() {
    await this.sessions.init();
    await this.chat.init();
  }
  find(id: string) {
    return this.sessions
      .findOne({ id })
      .session(this.tx.session ?? null)
      .select("-_id")
      .lean()
      .exec();
  }
  activeCount(userId: string) {
    return this.sessions
      .countDocuments({ userId, status: { $in: ["waiting", "active"] } })
      .session(this.tx.session ?? null)
      .exec();
  }
  async create(session: LiveSession) {
    await this.sessions.create([session], { session: this.tx.session });
  }
  save(session: LiveSession, version: number) {
    const { id, version: _v, ...values } = session;
    return this.sessions
      .findOneAndUpdate(
        { id, version },
        { $set: values, $inc: { version: 1 } },
        { session: this.tx.session, returnDocument: "after" },
      )
      .select("-_id")
      .lean()
      .exec();
  }
  async list(query: PageQuery, userId?: string) {
    const filter = {
      ...(userId ? { userId } : {}),
      ...(query.q
        ? { subject: { $regex: literalSearch(query.q), $options: "i" } }
        : {}),
    };
    const total = await this.sessions.countDocuments(filter),
      pages = Math.max(1, Math.ceil(total / query.limit)),
      page = Math.min(query.page, pages);
    return {
      total,
      pages,
      page,
      items: await this.sessions
        .find(filter)
        .sort({ updatedAt: -1, id: 1 })
        .skip((page - 1) * query.limit)
        .limit(query.limit)
        .select("-_id")
        .lean()
        .exec(),
    };
  }
  message(id: string) {
    return this.chat
      .findOne({ id })
      .session(this.tx.session ?? null)
      .select("-_id")
      .lean()
      .exec();
  }
  async append(message: LiveMessage) {
    await this.chat.create([message], { session: this.tx.session });
  }
  async messages(sessionId: string, query: PageQuery) {
    const total = await this.chat.countDocuments({ sessionId }),
      pages = Math.max(1, Math.ceil(total / query.limit)),
      page = Math.min(query.page, pages);
    return {
      total,
      pages,
      page,
      items: await this.chat
        .find({ sessionId })
        .sort({ createdAt: 1, id: 1 })
        .skip((page - 1) * query.limit)
        .limit(query.limit)
        .select("-_id -actorId")
        .lean()
        .exec(),
    };
  }
}
