import { Inject, Injectable, type OnModuleInit } from "@nestjs/common";
import { Schema, type Connection, type Model } from "mongoose";
import { DATABASE, MongoTransactions } from "../../../infrastructure/database";
import type { StudioRepository } from "../application/studio.repository";
import type {
  StudioPolicy,
  StudioJob,
  CreditLot,
  CreditPurchase,
} from "../domain/studio";
import type { PageQuery } from "../../../shared/page";
@Injectable()
export class MongoStudioRepository implements StudioRepository, OnModuleInit {
  private readonly policies: Model<StudioPolicy>;
  private readonly jobs: Model<StudioJob>;
  private readonly lots: Model<CreditLot>;
  private readonly purchases: Model<CreditPurchase>;
  constructor(
    @Inject(DATABASE) db: Connection,
    private readonly tx: MongoTransactions,
  ) {
    this.policies = db.model<StudioPolicy>(
      "StudioPolicy",
      new Schema<StudioPolicy>(
        {
          id: { type: String, unique: true },
          costs: { model: Number, scene: Number, upscale: Number },
          creditPriceCents: Number,
          version: Number,
        },
        { versionKey: false },
      ),
    );
    const job = new Schema<StudioJob>(
      {
        id: { type: String, unique: true },
        scopeId: String,
        targetKind: String,
        actorId: String,
        productId: String,
        sourceUrl: String,
        mode: String,
        prompt: String,
        ratio: String,
        cost: Number,
        policyVersion: Number,
        status: String,
        outputs: [String],
        allocations: [
          new Schema({ lotId: String, credits: Number }, { _id: false }),
        ],
        version: Number,
        createdAt: Date,
      },
      { versionKey: false },
    );
    job.index({ scopeId: 1, createdAt: -1, id: 1 });
    this.jobs = db.model<StudioJob>("StudioJob", job);
    const lot = new Schema<CreditLot>(
      {
        id: { type: String, unique: true },
        scopeId: String,
        available: Number,
        held: Number,
        spent: Number,
        refundable: Boolean,
      },
      { versionKey: false },
    );
    lot.index({ scopeId: 1, available: 1, id: 1 });
    this.lots = db.model<CreditLot>("StudioCreditLot", lot);
    this.purchases = db.model<CreditPurchase>(
      "StudioCreditPurchase",
      new Schema<CreditPurchase>(
        {
          id: { type: String, unique: true },
          scopeId: String,
          actorId: String,
          credits: Number,
          amountCents: Number,
          status: String,
          providerReference: String,
          refundId: String,
          createdAt: Date,
        },
        { versionKey: false },
      ),
    );
  }
  async onModuleInit() {
    await Promise.all([
      this.policies.init(),
      this.jobs.init(),
      this.lots.init(),
      this.purchases.init(),
    ]);
  }
  policy() {
    return this.policies
      .findOne({ id: "studio" })
      .session(this.tx.session ?? null)
      .select("-_id")
      .lean()
      .exec();
  }
  savePolicy(policy: StudioPolicy, version: number) {
    const { id, version: _v, ...values } = policy;
    return this.policies
      .findOneAndUpdate(
        { id, version },
        { $set: values, $inc: { version: 1 } },
        {
          upsert: version === 0,
          returnDocument: "after",
          session: this.tx.session,
        },
      )
      .select("-_id")
      .lean()
      .exec();
  }
  job(id: string) {
    return this.jobs
      .findOne({ id })
      .session(this.tx.session ?? null)
      .select("-_id")
      .lean()
      .exec();
  }
  async createJob(job: StudioJob) {
    await this.jobs.create([job], { session: this.tx.session });
  }
  async saveJob(job: StudioJob, version: number) {
    const { id, version: _v, ...values } = job;
    return (
      (
        await this.jobs.updateOne(
          { id, version },
          { $set: values, $inc: { version: 1 } },
          { session: this.tx.session },
        )
      ).modifiedCount === 1
    );
  }
  async list(scopeId: string, query: PageQuery) {
    const total = await this.jobs.countDocuments({ scopeId }),
      pages = Math.max(1, Math.ceil(total / query.limit)),
      page = Math.min(query.page, pages);
    return {
      total,
      pages,
      page,
      items: await this.jobs
        .find({ scopeId })
        .sort({ createdAt: -1, id: 1 })
        .skip((page - 1) * query.limit)
        .limit(query.limit)
        .select("-_id")
        .lean()
        .exec(),
    };
  }
  lot(id: string) {
    return this.lots
      .findOne({ id })
      .session(this.tx.session ?? null)
      .select("-_id")
      .lean()
      .exec();
  }
  async createLot(lot: CreditLot) {
    await this.lots.create([lot], { session: this.tx.session });
  }
  async reserveLot(scopeId: string, limit: number) {
    const lot = await this.lots
      .findOne({ scopeId, available: { $gt: 0 } })
      .session(this.tx.session ?? null)
      .sort({ id: 1 })
      .lean();
    if (!lot) return null;
    const credits = Math.min(limit, lot.available);
    const updated = await this.lots.updateOne(
      { id: lot.id, available: { $gte: credits } },
      { $inc: { available: -credits, held: credits } },
      { session: this.tx.session },
    );
    return updated.modifiedCount === 1 ? { lotId: lot.id, credits } : null;
  }
  async releaseLot(id: string, credits: number, consume: boolean) {
    return (
      (
        await this.lots.updateOne(
          { id, held: { $gte: credits } },
          {
            $inc: {
              held: -credits,
              ...(consume ? { spent: credits } : { available: credits }),
            },
          },
          { session: this.tx.session },
        )
      ).modifiedCount === 1
    );
  }
  async refundLot(id: string, credits: number) {
    return (
      (
        await this.lots.updateOne(
          { id, available: credits, held: 0, spent: 0 },
          { $set: { available: 0 } },
          { session: this.tx.session },
        )
      ).modifiedCount === 1
    );
  }
  async balance(scopeId: string) {
    const [result] = await this.lots.aggregate<{
      available: number;
      held: number;
      spent: number;
    }>([
      { $match: { scopeId } },
      {
        $group: {
          _id: null,
          available: { $sum: "$available" },
          held: { $sum: "$held" },
          spent: { $sum: "$spent" },
        },
      },
    ]);
    return result ?? { available: 0, held: 0, spent: 0 };
  }
  purchaseByRefund(refundId: string) {
    return this.purchases
      .findOne({ refundId })
      .session(this.tx.session ?? null)
      .select("-_id")
      .lean()
      .exec();
  }
  async restoreLot(id: string, credits: number) {
    return (
      (
        await this.lots.updateOne(
          { id, available: 0, held: 0, spent: 0 },
          { $set: { available: credits } },
          { session: this.tx.session },
        )
      ).modifiedCount === 1
    );
  }
  purchase(id: string) {
    return this.purchases
      .findOne({ id })
      .session(this.tx.session ?? null)
      .select("-_id")
      .lean()
      .exec();
  }
  async createPurchase(purchase: CreditPurchase) {
    await this.purchases.create([purchase], { session: this.tx.session });
  }
  async savePurchase(
    purchase: CreditPurchase,
    status: CreditPurchase["status"],
  ) {
    return (
      (
        await this.purchases.updateOne(
          { id: purchase.id, status },
          { $set: purchase },
          { session: this.tx.session },
        )
      ).modifiedCount === 1
    );
  }
}
