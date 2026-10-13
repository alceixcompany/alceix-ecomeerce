import { Inject, Injectable, type OnModuleInit } from "@nestjs/common";
import { Schema, type Connection, type Model } from "mongoose";
import { DATABASE, MongoTransactions } from "../../../infrastructure/database";
import type { JobsRepository } from "../application/jobs.repository";
import type { IntegrationJob, ProviderEvent } from "../domain/job";
import type { PageQuery } from "../../../shared/page";
@Injectable()
export class MongoJobsRepository implements JobsRepository, OnModuleInit {
  private readonly model: Model<IntegrationJob>;
  private readonly events: Model<ProviderEvent>;
  constructor(
    @Inject(DATABASE) db: Connection,
    private readonly tx: MongoTransactions,
  ) {
    const schema = new Schema<IntegrationJob>(
      {
        id: { type: String, unique: true },
        scopeId: String,
        ownerId: String,
        operation: String,
        input: Schema.Types.Mixed,
        status: String,
        result: Schema.Types.Mixed,
        attempts: Number,
        maxAttempts: Number,
        availableAt: Date,
        leaseUntil: Date,
        leaseId: String,
        lastError: String,
        reconcileAfter: Date,
        createdAt: Date,
        version: Number,
      },
      { versionKey: false },
    );
    schema.index({ status: 1, availableAt: 1 });
    schema.index({ status: 1, reconcileAfter: 1, createdAt: 1 });
    schema.index({ scopeId: 1, createdAt: -1, id: 1 });
    this.model = db.model<IntegrationJob>("IntegrationJob", schema);
    this.events = db.model<ProviderEvent>(
      "ProviderEvent",
      new Schema<ProviderEvent>(
        {
          id: { type: String, unique: true },
          referenceId: String,
          kind: String,
          fingerprint: String,
          createdAt: Date,
        },
        { versionKey: false },
      ),
    );
  }
  async onModuleInit() {
    await Promise.all([this.model.init(), this.events.init()]);
  }
  reconciliationCandidate(now: Date) {
    return this.model
      .findOneAndUpdate(
        {
          operation: {
            $nin: [
              "identity.phone-start",
              "identity.phone-verify",
              "events.pull",
            ],
          },
          attempts: { $gt: 0 },
          createdAt: { $lte: new Date(now.getTime() - 30000) },
          $and: [
            {
              $or: [
                { status: { $in: ["awaiting", "queued"] } },
                { status: "failed", lastError: "PROVIDER_REQUEST_FAILED" },
              ],
            },
          ],
          $or: [
            { reconcileAfter: { $exists: false } },
            { reconcileAfter: { $lte: now } },
          ],
        },
        { $set: { reconcileAfter: new Date(now.getTime() + 60000) } },
        {
          sort: { reconcileAfter: 1, createdAt: 1, id: 1 },
          returnDocument: "after",
        },
      )
      .select("-_id")
      .lean()
      .exec();
  }
  find(id: string) {
    return this.model
      .findOne({ id })
      .session(this.tx.session ?? null)
      .select("-_id")
      .lean()
      .exec();
  }
  async create(job: IntegrationJob) {
    await this.model.create([job], { session: this.tx.session });
  }
  async claim(now: Date, leaseId: string, id?: string) {
    await this.model.updateMany(
      {
        status: "processing",
        leaseUntil: { $lte: now },
        $expr: { $gte: ["$attempts", { $ifNull: ["$maxAttempts", 8] }] },
      },
      {
        $set: { status: "awaiting", lastError: "DISPATCH_BUDGET_EXHAUSTED" },
        $unset: { leaseId: 1, leaseUntil: 1 },
        $inc: { version: 1 },
      },
    );

    return this.model
      .findOneAndUpdate(
        {
          ...(id ? { id } : { operation: { $ne: "notification.send" } }),
          $expr: { $lt: ["$attempts", { $ifNull: ["$maxAttempts", 8] }] },
          $or: [
            { status: "queued", availableAt: { $lte: now } },
            { status: "processing", leaseUntil: { $lte: now } },
          ],
        },
        {
          $set: {
            status: "processing",
            leaseId,
            leaseUntil: new Date(now.getTime() + 30000),
          },
          $inc: { attempts: 1, version: 1 },
        },
        { sort: { availableAt: 1, id: 1 }, returnDocument: "after" },
      )
      .select("-_id")
      .lean()
      .exec();
  }
  async finish(job: IntegrationJob, leaseId: string) {
    const {
      id,
      version: _v,
      leaseId: _lease,
      leaseUntil: _until,
      ...values
    } = job;
    const result = await this.model.updateOne(
      { id, status: "processing", leaseId },
      {
        $set: values,
        $unset: { leaseId: 1, leaseUntil: 1 },
        $inc: { version: 1 },
      },
    );
    if (result.modifiedCount !== 1 && job.result)
      await this.model.updateOne(
        {
          id,
          attempts: job.attempts,
          status: { $in: ["succeeded", "failed"] },
          result: { $exists: false },
        },
        { $set: { result: job.result } },
      );
    return result.modifiedCount === 1;
  }
  async complete(id: string, success: boolean) {
    await this.model.updateOne(
      { id, status: { $ne: "cancelled" } },
      {
        $set: {
          status: success ? "succeeded" : "failed",
          lastError: success ? "" : "PROVIDER_TERMINAL_FAILURE",
        },
        $unset: { leaseId: 1, leaseUntil: 1 },
        $inc: { version: 1 },
      },
      { session: this.tx.session },
    );
  }
  retry(id: string, ownerId: string) {
    return this.model
      .findOneAndUpdate(
        {
          id,
          ownerId,
          $or: [
            { status: "failed", lastError: "PROVIDER_REQUEST_FAILED" },
            { status: "awaiting", lastError: "DISPATCH_BUDGET_EXHAUSTED" },
          ],
        },
        [
          {
            $set: {
              status: "queued",
              availableAt: new Date(),
              lastError: "",
              maxAttempts: { $max: [8, { $add: ["$attempts", 1] }] },
              version: { $add: ["$version", 1] },
            },
          },
        ],
        {
          returnDocument: "after",
          session: this.tx.session,
          updatePipeline: true,
        },
      )
      .select("-_id")
      .lean()
      .exec();
  }
  cancel(id: string, ownerId: string, confirmed = false) {
    return this.model
      .findOneAndUpdate(
        {
          id,
          ownerId,
          ...(confirmed
            ? { status: { $nin: ["succeeded", "cancelled"] } }
            : { status: "queued", attempts: 0 }),
        },
        { $set: { status: "cancelled" }, $inc: { version: 1 } },
        { returnDocument: "after", session: this.tx.session },
      )
      .select("-_id")
      .lean()
      .exec();
  }
  async list(scopeId: string, query: PageQuery) {
    const filter = { scopeId };
    const total = await this.model.countDocuments(filter),
      pages = Math.max(1, Math.ceil(total / query.limit)),
      page = Math.min(query.page, pages);
    return {
      total,
      pages,
      page,
      items: await this.model
        .find(filter)
        .sort({ createdAt: -1, id: 1 })
        .skip((page - 1) * query.limit)
        .limit(query.limit)
        .select("-_id")
        .lean()
        .exec(),
    };
  }
  event(id: string) {
    return this.events
      .findOne({ id })
      .session(this.tx.session ?? null)
      .select("-_id")
      .lean()
      .exec();
  }
  async appendEvent(event: ProviderEvent) {
    await this.events.create([event], { session: this.tx.session });
  }
  async defer(id: string) {
    await this.model.updateOne(
      { id, status: { $in: ["queued", "failed"] } },
      {
        $set: {
          status: "awaiting",
          lastError: "DISPATCH_STOPPED_AFTER_ATTEMPT",
        },
        $inc: { version: 1 },
      },
      { session: this.tx.session },
    );
  }
}
