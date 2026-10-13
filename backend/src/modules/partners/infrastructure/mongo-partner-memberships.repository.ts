import { Inject, Injectable, type OnModuleInit } from "@nestjs/common";
import { Schema, type Connection, type Model } from "mongoose";
import { DATABASE, MongoTransactions } from "../../../infrastructure/database";
import { AppError } from "../../../shared/errors";
import type { PartnerMembershipsRepository } from "../application/partner-memberships.repository";
import type {
  PartnerMembership,
  PartnerRole,
} from "../domain/partner-membership";
@Injectable()
export class MongoPartnerMembershipsRepository
  implements PartnerMembershipsRepository, OnModuleInit
{
  private readonly model: Model<PartnerMembership>;
  private readonly quota: Model<{ partnerId: string; count: number }>;
  constructor(
    @Inject(DATABASE) db: Connection,
    private readonly tx: MongoTransactions,
  ) {
    const schema = new Schema<PartnerMembership>(
      {
        id: { type: String, unique: true, required: true },
        partnerId: { type: String, required: true },
        email: { type: String, required: true },
        role: {
          type: String,
          enum: ["operations", "finance", "support", "viewer"],
          required: true,
        },
        status: {
          type: String,
          enum: ["invited", "active", "paused"],
          required: true,
        },
        userId: String,
        version: Number,
        tokenHash: String,
        expiresAt: Date,
        createdAt: Date,
      },
      { versionKey: false },
    );
    schema.index({ partnerId: 1, email: 1 }, { unique: true });
    schema.index({ partnerId: 1, userId: 1, status: 1 });
    schema.index({ userId: 1, status: 1 });
    schema.index({ partnerId: 1, status: 1, expiresAt: 1 });
    schema.index({ tokenHash: 1 }, { unique: true, sparse: true });
    this.model = db.model("PartnerMembership", schema);
    this.quota = db.model<{ partnerId: string; count: number }>(
      "PartnerTeamQuota",
      new Schema<{ partnerId: string; count: number }>(
        {
          partnerId: { type: String, unique: true, required: true },
          count: Number,
        },
        { versionKey: false },
      ),
    );
  }
  async onModuleInit() {
    await this.model.init();
    await this.quota.init();
  }
  list(partnerId: string) {
    return this.model
      .find({ partnerId })
      .sort({ createdAt: 1, id: 1 })
      .limit(99)
      .select("-_id")
      .lean()
      .exec();
  }
  active(partnerId: string, userId: string) {
    return this.model
      .findOne({ partnerId, userId, status: "active" })
      .session(this.tx.session ?? null)
      .select("-_id")
      .lean()
      .exec();
  }
  async partnerIds(userId: string) {
    const members = await this.model
      .find({ userId, status: "active" })
      .limit(100)
      .select("partnerId -_id")
      .lean()
      .exec();
    return members.map((member) => member.partnerId);
  }
  async create(member: PartnerMembership) {
    await this.quota.updateOne(
      { partnerId: member.partnerId },
      { $setOnInsert: { count: 0 } },
      { upsert: true, session: this.tx.session },
    );
    const quota = await this.quota.findOneAndUpdate(
      { partnerId: member.partnerId, count: { $lt: 99 } },
      { $inc: { count: 1 } },
      { session: this.tx.session },
    );
    if (!quota)
      throw new AppError(
        422,
        "TEAM_LIMIT",
        "Sahip dahil en fazla 100 ekip kaydı desteklenir.",
      );
    await this.model.create([member], { session: this.tx.session });
  }
  byToken(tokenHash: string) {
    return this.model
      .findOne({ tokenHash, status: "invited", expiresAt: { $gt: new Date() } })
      .session(this.tx.session ?? null)
      .select("-_id")
      .lean()
      .exec();
  }
  accept(id: string, tokenHash: string, userId: string) {
    return this.model
      .findOneAndUpdate(
        { id, tokenHash, status: "invited", expiresAt: { $gt: new Date() } },
        {
          $set: { userId, status: "active" },
          $unset: { tokenHash: "", expiresAt: "" },
          $inc: { version: 1 },
        },
        { returnDocument: "after", session: this.tx.session },
      )
      .select("-_id")
      .lean()
      .exec();
  }
  role(partnerId: string, id: string, version: number, role: PartnerRole) {
    return this.model
      .findOneAndUpdate(
        { partnerId, id, version },
        { $set: { role }, $inc: { version: 1 } },
        { returnDocument: "after" },
      )
      .select("-_id")
      .lean()
      .exec();
  }
  async status(
    partnerId: string,
    id: string,
    version: number,
    status: "active" | "paused",
  ) {
    const result = await this.model.updateOne(
      {
        partnerId,
        id,
        version,
        userId: { $exists: true },
        status: { $in: ["active", "paused"] },
      },
      { $set: { status }, $inc: { version: 1 } },
      { session: this.tx.session },
    );
    return result.modifiedCount === 1;
  }
  async remove(partnerId: string, id: string, version: number) {
    const removed = await this.model.deleteOne(
      { partnerId, id, version },
      { session: this.tx.session },
    );
    if (!removed.deletedCount) return false;
    await this.quota.updateOne(
      { partnerId, count: { $gt: 0 } },
      { $inc: { count: -1 } },
      { session: this.tx.session },
    );
    return true;
  }
  async expire(partnerId: string, now: Date) {
    const expired = await this.model.deleteMany(
      { partnerId, status: "invited", expiresAt: { $lte: now } },
      { session: this.tx.session },
    );
    if (expired.deletedCount) {
      const result = await this.quota.updateOne(
        { partnerId, count: { $gte: expired.deletedCount } },
        { $inc: { count: -expired.deletedCount } },
        { session: this.tx.session },
      );
      if (result.matchedCount !== 1)
        throw new Error("Team quota is inconsistent");
    }
  }
  reissue(
    partnerId: string,
    id: string,
    version: number,
    tokenHash: string,
    expiresAt: Date,
  ) {
    return this.model
      .findOneAndUpdate(
        { partnerId, id, version, status: "invited" },
        { $set: { tokenHash, expiresAt }, $inc: { version: 1 } },
        { session: this.tx.session, returnDocument: "after" },
      )
      .select("-_id")
      .lean()
      .exec();
  }
}
