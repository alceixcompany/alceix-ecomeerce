import type { ReplyDraft } from "../domain/draft";
import { Inject, Injectable, type OnModuleInit } from "@nestjs/common";
import { Schema, type Connection, type Model } from "mongoose";
import { DATABASE, MongoTransactions } from "../../../infrastructure/database";
import type { SupportRepository } from "../application/support.repository";
import type { Ticket, TicketQuery } from "../domain/ticket";
@Injectable()
export class MongoSupportRepository implements SupportRepository, OnModuleInit {
  private readonly model: Model<Ticket>;
  private readonly drafts: Model<ReplyDraft>;
  constructor(
    @Inject(DATABASE) db: Connection,
    private readonly tx: MongoTransactions,
  ) {
    const message = new Schema(
      {
        id: String,
        author: String,
        actorId: String,
        name: String,
        text: String,
        createdAt: Date,
        attachments: [
          new Schema(
            { id: String, name: String, mime: String, size: Number },
            { _id: false },
          ),
        ],
      },
      { _id: false },
    );
    const schema = new Schema<Ticket>(
      {
        id: { type: String, required: true, unique: true },
        scopeKind: String,
        storeId: { type: String, required: true },
        version: Number,
        buyerId: String,
        assignedTo: String,
        internalNote: String,
        channel: String,
        category: String,
        subject: String,
        priority: String,
        status: String,
        requester: String,
        createdAt: Date,
        updatedAt: Date,
        messages: [message],
      },
      { versionKey: false },
    );
    schema.index({ storeId: 1, channel: 1, status: 1, updatedAt: -1, id: 1 });
    schema.index({ channel: 1, updatedAt: -1, id: 1 });
    this.model = db.model("SupportTicket", schema);
    const draft = new Schema<ReplyDraft>(
      {
        storeId: { type: String, required: true },
        ticketId: { type: String, required: true },
        userId: { type: String, required: true },
        text: String,
        attachmentIds: [String],
        version: Number,
        updatedAt: Date,
      },
      { versionKey: false },
    );
    draft.index({ storeId: 1, ticketId: 1, userId: 1 }, { unique: true });
    this.drafts = db.model<ReplyDraft>("SupportReplyDraft", draft);
  }
  async onModuleInit() {
    await this.model.init();
    await this.drafts.init();
  }
  async create(ticket: Ticket) {
    await this.model.create([ticket], { session: this.tx.session });
  }
  find(storeId: string, id: string) {
    return this.model.findOne({ storeId, id }).select("-_id").lean().exec();
  }
  async list(
    storeId: string | undefined,
    query: TicketQuery,
    buyerId?: string,
  ) {
    const filter = {
      ...(storeId ? { storeId } : {}),
      ...(buyerId ? { buyerId } : {}),
      ...(query.channel !== "all" ? { channel: query.channel } : {}),
      ...(query.status !== "all" ? { status: query.status } : {}),
      ...(query.priority !== "all" ? { priority: query.priority } : {}),
      ...(query.q
        ? {
            $or: ["subject", "requester", "id"].map((field) => ({
              [field]: {
                $regex: query.q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
                $options: "i",
              },
            })),
          }
        : {}),
    };
    const total = await this.model.countDocuments(filter),
      pages = Math.max(1, Math.ceil(total / query.limit)),
      page = Math.min(pages, query.page);
    const items = await this.model
      .find(filter)
      .sort({ updatedAt: -1, id: 1 })
      .skip((page - 1) * query.limit)
      .limit(query.limit)
      .select("-_id")
      .lean()
      .exec();
    return { items, total, page, pages };
  }
  draft(storeId: string, ticketId: string, userId: string) {
    return this.drafts
      .findOne({ storeId, ticketId, userId })
      .select("-_id")
      .lean()
      .exec();
  }
  saveDraft(draft: ReplyDraft) {
    const { storeId, ticketId, userId, version, text, attachmentIds } = draft;
    return this.drafts
      .findOneAndUpdate(
        { storeId, ticketId, userId, version },
        {
          $set: { text, attachmentIds, updatedAt: new Date() },
          $inc: { version: 1 },
        },
        { returnDocument: "after", upsert: version === 0 },
      )
      .select("-_id")
      .lean()
      .exec();
  }
  async clearMatchingDraft(
    storeId: string,
    ticketId: string,
    userId: string,
    text: string,
    attachmentIds: string[],
  ) {
    await this.drafts.updateOne(
      { storeId, ticketId, userId, text, attachmentIds },
      {
        $set: { text: "", attachmentIds: [], updatedAt: new Date() },
        $inc: { version: 1 },
      },
      { session: this.tx.session },
    );
  }
  save(ticket: Ticket, version: number) {
    const { id, storeId, version: _revision, ...values } = ticket;
    return this.model
      .findOneAndUpdate(
        { id, storeId, version },
        { $set: values, $inc: { version: 1 } },
        { returnDocument: "after", session: this.tx.session },
      )
      .select("-_id")
      .lean()
      .exec();
  }
}
