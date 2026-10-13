import type { OrderMetric, CartMetricInput } from "../domain/customer";
import { Inject, Injectable, type OnModuleInit } from "@nestjs/common";
import {
  Schema,
  type Connection,
  type Model,
  type QueryFilter,
} from "mongoose";
import { DATABASE, MongoTransactions } from "../../../infrastructure/database";
import type { CrmRepository } from "../application/crm.repository";
import type {
  Customer,
  CustomerInput,
  CustomerQuery,
  CrmSettings,
  SettingsRecord,
} from "../domain/customer";
import type {
  CommunicationDraft,
  CommunicationInput,
} from "../domain/communication";
@Injectable()
export class MongoCrmRepository implements CrmRepository, OnModuleInit {
  private readonly metrics: Model<OrderMetric>;
  private readonly customers: Model<Customer>;
  private readonly drafts: Model<CommunicationDraft>;
  private readonly rules: Model<SettingsRecord>;
  constructor(
    @Inject(DATABASE) db: Connection,
    private readonly tx: MongoTransactions,
  ) {
    const schema = new Schema<Customer>(
      {
        id: { type: String, required: true, unique: true },
        storeId: { type: String, required: true },
        version: { type: Number, required: true },
        name: String,
        email: { type: String, required: true },
        phone: String,
        city: String,
        consent: Boolean,
        note: String,
        createdAt: Date,
        updatedAt: Date,
        consentUpdatedAt: Date,
        dispatchLock: Number,
        orders: Number,
        spentCents: Number,
        lastOrderAt: Date,
        cartCents: Number,
        cartHash: String,
        cartBuyerId: String,
        cartUpdatedAt: Date,
        cartExpiresAt: Date,
        cartReminderAt: Date,
      },
      { versionKey: false },
    );
    schema.index({ storeId: 1, email: 1 }, { unique: true });
    schema.index({ storeId: 1, createdAt: -1, id: 1 });
    schema.index({ storeId: 1, spentCents: -1, id: 1 });
    schema.index({ storeId: 1, lastOrderAt: -1, id: 1 });
    schema.index({ consent: 1, cartCents: 1, cartUpdatedAt: 1 });
    this.customers = db.model("CrmCustomer", schema);
    const metric = new Schema<OrderMetric>(
      {
        id: { type: String, unique: true },
        storeId: String,
        email: String,
        version: Number,
        paid: Boolean,
        totalCents: Number,
        createdAt: Date,
      },
      { versionKey: false },
    );
    metric.index({ storeId: 1, email: 1, paid: 1 });
    this.metrics = db.model<OrderMetric>("CrmOrderMetric", metric);
    const communication = new Schema<CommunicationDraft>(
      {
        id: { type: String, required: true, unique: true },
        storeId: { type: String, required: true },
        requestId: { type: String, required: true },
        initialInput: new Schema<CommunicationInput>(
          { kind: String, segment: String, subject: String, message: String },
          { _id: false },
        ),
        kind: String,
        segment: String,
        subject: String,
        message: String,
        version: Number,
        createdAt: Date,
        updatedAt: Date,
      },
      { versionKey: false },
    );
    communication.index({ storeId: 1, requestId: 1 }, { unique: true });
    communication.index({ storeId: 1, kind: 1, updatedAt: -1, id: 1 });
    this.drafts = db.model<CommunicationDraft>(
      "CrmCommunicationDraft",
      communication,
    );
    const settings = new Schema<CrmSettings>(
      {
        earnRate: Number,
        pointCents: Number,
        abandonedEnabled: Boolean,
        delayHours: Number,
        discount: Number,
        template: String,
      },
      { _id: false },
    );
    this.rules = db.model<SettingsRecord>(
      "CrmSettings",
      new Schema<SettingsRecord>(
        {
          storeId: { type: String, required: true, unique: true },
          version: Number,
          settings,
        },
        { versionKey: false },
      ),
    );
  }
  async onModuleInit() {
    await this.metrics.init();
    await this.customers.init();
    await this.rules.init();
    await this.drafts.init();
  }
  async list(storeId: string, query: CustomerQuery) {
    const filter: QueryFilter<Customer> = { storeId };
    if (query.q) {
      const re = new RegExp(
        query.q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i",
      );
      filter.$or = ["name", "email", "phone", "city"].map((field) => ({
        [field]: re,
      }));
    }
    Object.assign(filter, this.segmentFilter(query.segment));
    if (query.spend === "high") filter.spentCents = { $gte: 500000 };
    if (query.spend === "low")
      filter.$and = [
        ...(filter.$and ?? []),
        {
          $or: [
            { spentCents: { $lt: 500000 } },
            { spentCents: { $exists: false } },
          ],
        },
      ];
    if (query.last === "recent") {
      filter.orders = { $gt: 0 };
      filter.lastOrderAt = { $gte: new Date(Date.now() - 31 * 86400000) };
    }
    if (query.last === "inactive") {
      filter.orders = { $gt: 0 };
      filter.lastOrderAt = { $lte: new Date(Date.now() - 90 * 86400000) };
    }
    const total = await this.customers.countDocuments(filter),
      pages = Math.max(1, Math.ceil(total / query.limit)),
      page = Math.min(pages, query.page);
    const items = await this.customers
      .find(filter)
      .sort({ createdAt: -1, id: 1 })
      .skip((page - 1) * query.limit)
      .limit(query.limit)
      .select("-_id")
      .lean()
      .exec();
    return { items, total, page, pages };
  }
  async recipients(storeId: string, segment: CommunicationInput["segment"]) {
    const filter = {
      storeId,
      consent: true,
      ...this.segmentFilter(segment),
    };
    const total = await this.customers.countDocuments(filter);
    const items = await this.customers
      .find(filter)
      .sort({ createdAt: -1, id: 1 })
      .limit(10)
      .select("-_id")
      .lean()
      .exec();
    return { items, total };
  }
  async communications(
    storeId: string,
    kind: CommunicationInput["kind"],
    requestedPage: number,
    limit: number,
  ) {
    const filter = { storeId, kind };
    const total = await this.drafts.countDocuments(filter),
      pages = Math.max(1, Math.ceil(total / limit)),
      page = Math.min(requestedPage, pages);
    const items = await this.drafts
      .find(filter)
      .sort({ updatedAt: -1, id: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select("-_id")
      .lean()
      .exec();
    return { items, total, page, pages };
  }
  communicationByRequest(storeId: string, requestId: string) {
    return this.drafts
      .findOne({ storeId, requestId })
      .select("-_id")
      .lean()
      .exec();
  }
  async createCommunication(
    draft: CommunicationDraft,
  ): Promise<"created" | "duplicate"> {
    try {
      await this.drafts.create(draft);
      return "created";
    } catch (error) {
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === 11000
      )
        return "duplicate";
      throw error;
    }
  }
  updateCommunication(
    storeId: string,
    id: string,
    version: number,
    input: CommunicationInput,
  ) {
    return this.drafts
      .findOneAndUpdate(
        { storeId, id, version, kind: input.kind },
        [
          {
            $set: {
              // Preserve legacy creation input before the first edit; later edits leave it intact.
              initialInput: {
                $ifNull: [
                  "$initialInput",
                  {
                    kind: "$kind",
                    segment: "$segment",
                    subject: "$subject",
                    message: "$message",
                  },
                ],
              },
              segment: { $literal: input.segment },
              subject: { $literal: input.subject },
              message: { $literal: input.message },
              updatedAt: "$$NOW",
              version: { $add: ["$version", 1] },
            },
          },
        ],
        { returnDocument: "after", updatePipeline: true },
      )
      .select("-_id")
      .lean()
      .exec();
  }
  async create(customer: Customer) {
    await this.customers.create(customer);
  }
  update(storeId: string, id: string, version: number, input: CustomerInput) {
    return this.customers
      .findOneAndUpdate(
        { storeId, id, version },
        [
          {
            $set: {
              name: { $literal: input.name },
              email: { $literal: input.email },
              phone: { $literal: input.phone },
              city: { $literal: input.city },
              note: { $literal: input.note },
              consentUpdatedAt: {
                $cond: [
                  { $ne: ["$consent", input.consent] },
                  "$$NOW",
                  "$consentUpdatedAt",
                ],
              },
              consent: input.consent,
              updatedAt: "$$NOW",
              version: { $add: ["$version", 1] },
            },
          },
        ],
        { returnDocument: "after", updatePipeline: true },
      )
      .select("-_id")
      .lean()
      .exec();
  }
  settings(storeId: string) {
    return this.rules.findOne({ storeId }).select("-_id").lean().exec();
  }
  saveSettings(storeId: string, version: number, settings: CrmSettings) {
    return this.rules
      .findOneAndUpdate(
        { storeId, version },
        { $set: { settings }, $inc: { version: 1 } },
        { returnDocument: "after", upsert: version === 0 },
      )
      .select("-_id")
      .lean()
      .exec();
  }
  recipientAfter(
    storeId: string,
    segment: CommunicationInput["segment"],
    afterId: string,
    before: Date,
  ) {
    return this.customers
      .find({
        storeId,
        consent: true,
        id: { $gt: afterId },
        ...this.segmentFilter(segment, before),
        createdAt: {
          $lte: before,
          ...(segment === "new"
            ? { $gte: new Date(before.getTime() - 31 * 86400000) }
            : {}),
        },
      })
      .sort({ id: 1 })
      .limit(100)
      .select("-_id")
      .lean()
      .exec();
  }
  customer(storeId: string, id: string) {
    return this.customers
      .findOne({ storeId, id })
      .session(this.tx.session ?? null)
      .select("-_id")
      .lean()
      .exec();
  }
  byEmail(storeId: string, email: string) {
    return this.customers
      .findOne({ storeId, email })
      .session(this.tx.session ?? null)
      .select("-_id")
      .lean()
      .exec();
  }
  async optOut(storeId: string, id: string, enabled: boolean) {
    await this.customers.updateOne(
      { storeId, id },
      {
        $set: { consent: enabled, consentUpdatedAt: new Date() },
        $inc: { version: 1 },
      },
      { session: this.tx.session },
    );
  }
  recipientPage(
    storeId: string,
    segment: CommunicationInput["segment"],
    page: number,
  ) {
    return this.customers
      .find({
        storeId,
        consent: true,
        ...(segment === "new"
          ? { createdAt: { $gte: new Date(Date.now() - 31 * 86400000) } }
          : {}),
      })
      .sort({ createdAt: 1, id: 1 })
      .skip((page - 1) * 100)
      .limit(100)
      .select("-_id")
      .lean()
      .exec();
  }
  draftById(storeId: string, id: string) {
    return this.drafts.findOne({ storeId, id }).select("-_id").lean().exec();
  }
  private segmentFilter(
    segment: CommunicationInput["segment"],
    now = new Date(),
  ): QueryFilter<Customer> {
    if (segment === "new")
      return { createdAt: { $gte: new Date(now.getTime() - 31 * 86400000) } };
    if (segment === "vip") return { spentCents: { $gte: 500000 } };
    if (segment === "inactive")
      return {
        orders: { $gt: 0 },
        lastOrderAt: { $lte: new Date(now.getTime() - 90 * 86400000) },
      };
    if (segment === "cart")
      return { cartCents: { $gt: 0 }, cartExpiresAt: { $gt: now } };
    return {};
  }
  async recordOrder(metric: OrderMetric) {
    const previous = await this.metrics
      .findOne({ id: metric.id })
      .session(this.tx.session ?? null)
      .lean()
      .exec();
    if (previous && previous.version >= metric.version) return;
    await this.metrics.updateOne(
      { id: metric.id },
      { $set: metric },
      { upsert: true, session: this.tx.session },
    );
    await this.refreshCustomer(metric.storeId, metric.email);
  }
  async refreshCustomer(storeId: string, email: string) {
    const totals = await this.metrics
      .aggregate<{ orders: number; spentCents: number; lastOrderAt: Date }>([
        { $match: { storeId, email, paid: true } },
        {
          $group: {
            _id: null,
            orders: { $sum: 1 },
            spentCents: { $sum: { $toDecimal: "$totalCents" } },
            lastOrderAt: { $max: "$createdAt" },
          },
        },
      ])
      .session(this.tx.session ?? null);
    const spentCents = Number(String(totals[0]?.spentCents ?? 0));
    if (!Number.isSafeInteger(spentCents))
      throw new Error("CRM amount exceeds supported range");
    await this.customers.updateOne(
      { storeId, email },
      {
        $set: {
          orders: totals[0]?.orders ?? 0,
          spentCents,
          lastOrderAt: totals[0]?.lastOrderAt ?? null,
        },
      },
      { session: this.tx.session },
    );
  }
  async recordCart(storeId: string, metric: CartMetricInput) {
    await this.customers.updateOne(
      {
        storeId,
        email: metric.email,
        $or: [
          { cartUpdatedAt: { $lte: metric.updatedAt } },
          { cartUpdatedAt: { $exists: false } },
        ],
      },
      {
        $set: {
          cartCents: metric.totalCents,
          cartHash: metric.hash,
          cartBuyerId: metric.buyerId,
          cartUpdatedAt: metric.updatedAt,
          cartExpiresAt: metric.expiresAt,
        },
        $unset: { cartReminderAt: 1 },
      },
      { session: this.tx.session },
    );
  }
  async clearCart(storeId: string, hash: string) {
    await this.customers.updateMany(
      { storeId, cartHash: hash },
      {
        $set: { cartCents: 0 },
        $unset: { cartHash: 1, cartBuyerId: 1, cartReminderAt: 1 },
      },
      { session: this.tx.session },
    );
  }
  async abandonedCandidate() {
    const rows = await this.customers
      .aggregate<{ customer: Customer; settings: CrmSettings }>([
        {
          $match: {
            consent: true,
            cartCents: { $gt: 0 },
            cartBuyerId: { $type: "string" },
            cartExpiresAt: { $gt: new Date() },
            $expr: {
              $or: [
                { $eq: [{ $ifNull: ["$cartReminderAt", null] }, null] },
                { $lt: ["$cartReminderAt", "$cartUpdatedAt"] },
              ],
            },
          },
        },
        {
          $lookup: {
            from: this.rules.collection.name,
            localField: "storeId",
            foreignField: "storeId",
            as: "rules",
          },
        },
        { $unwind: "$rules" },
        {
          $match: {
            "rules.settings.abandonedEnabled": true,
            $expr: {
              $lte: [
                "$cartUpdatedAt",
                {
                  $subtract: [
                    "$$NOW",
                    { $multiply: ["$rules.settings.delayHours", 3600000] },
                  ],
                },
              ],
            },
          },
        },
        { $sort: { cartUpdatedAt: 1, id: 1 } },
        { $limit: 1 },
        {
          $project: { customer: "$$ROOT", settings: "$rules.settings", _id: 0 },
        },
      ])
      .session(this.tx.session ?? null);
    return rows[0] ?? null;
  }
  async markReminder(storeId: string, id: string, updatedAt: Date) {
    const result = await this.customers.updateOne(
      {
        storeId,
        id,
        consent: true,
        cartUpdatedAt: updatedAt,
        $or: [
          { cartReminderAt: { $exists: false } },
          { cartReminderAt: { $lt: updatedAt } },
        ],
      },
      { $set: { cartReminderAt: new Date() } },
      { session: this.tx.session },
    );
    return result.modifiedCount === 1;
  }
  async lockRecipient(storeId: string, id: string) {
    const result = await this.customers.updateOne(
      { storeId, id, consent: true },
      { $inc: { dispatchLock: 1 } },
      { session: this.tx.session },
    );
    return result.matchedCount === 1;
  }
}
