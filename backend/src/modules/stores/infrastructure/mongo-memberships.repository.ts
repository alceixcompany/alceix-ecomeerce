import { Inject, Injectable, type OnModuleInit } from "@nestjs/common";
import { Schema, type Connection, type Model } from "mongoose";
import { DATABASE, MongoTransactions } from "../../../infrastructure/database";
import { AppError } from "../../../shared/errors";
import type { MembershipsRepository } from "../application/memberships.repository";
import type { Membership, TeamRole } from "../domain/membership";
@Injectable()
export class MongoMembershipsRepository
  implements MembershipsRepository, OnModuleInit
{
  private readonly model: Model<Membership>;
  private readonly quota: Model<{ storeId: string; count: number }>;
  constructor(
    @Inject(DATABASE) db: Connection,
    private readonly tx: MongoTransactions,
  ) {
    const schema = new Schema<Membership>(
      {
        id: { type: String, unique: true, required: true },
        storeId: { type: String, required: true },
        email: { type: String, required: true },
        role: {
          type: String,
          enum: ["editor", "support", "viewer"],
          required: true,
        },
        status: { type: String, enum: ["invited", "active"], required: true },
        userId: String,
        version: Number,
        tokenHash: String,
        expiresAt: Date,
        createdAt: Date,
      },
      { versionKey: false },
    );
    schema.index({ storeId: 1, email: 1 }, { unique: true });
    schema.index({ storeId: 1, userId: 1, status: 1 });
    schema.index({ userId: 1, status: 1 });
    schema.index({ storeId: 1, status: 1, expiresAt: 1 });
    schema.index({ tokenHash: 1 }, { unique: true, sparse: true });
    this.model = db.model("StoreMembership", schema);
    this.quota = db.model<{ storeId: string; count: number }>(
      "StoreTeamQuota",
      new Schema<{ storeId: string; count: number }>(
        {
          storeId: { type: String, unique: true, required: true },
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
  list(storeId: string) {
    return this.model
      .find({ storeId })
      .sort({ createdAt: 1, id: 1 })
      .limit(49)
      .select("-_id")
      .lean()
      .exec();
  }
  active(storeId: string, userId: string) {
    return this.model
      .findOne({ storeId, userId, status: "active" })
      .select("-_id")
      .lean()
      .exec();
  }
  async storeIds(userId: string) {
    const members = await this.model
      .find({ userId, status: "active" })
      .select("storeId -_id")
      .lean()
      .exec();
    return members.map((member) => member.storeId);
  }
  async create(member: Membership) {
    await this.quota.updateOne(
      { storeId: member.storeId },
      { $setOnInsert: { count: 0 } },
      { upsert: true, session: this.tx.session },
    );
    const quota = await this.quota.findOneAndUpdate(
      { storeId: member.storeId, count: { $lt: 49 } },
      { $inc: { count: 1 } },
      { session: this.tx.session },
    );
    if (!quota)
      throw new AppError(
        422,
        "TEAM_LIMIT",
        "Sahip dahil en fazla 50 ekip kaydı desteklenir.",
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
  role(storeId: string, id: string, version: number, role: TeamRole) {
    return this.model
      .findOneAndUpdate(
        { storeId, id, version },
        { $set: { role }, $inc: { version: 1 } },
        { returnDocument: "after" },
      )
      .select("-_id")
      .lean()
      .exec();
  }
  async remove(storeId: string, id: string, version: number) {
    const removed = await this.model.deleteOne(
      { storeId, id, version },
      { session: this.tx.session },
    );
    if (!removed.deletedCount) return false;
    await this.quota.updateOne(
      { storeId, count: { $gt: 0 } },
      { $inc: { count: -1 } },
      { session: this.tx.session },
    );
    return true;
  }
  async expire(storeId: string, now: Date) {
    const expired = await this.model.deleteMany(
      { storeId, status: "invited", expiresAt: { $lte: now } },
      { session: this.tx.session },
    );
    if (expired.deletedCount) {
      const result = await this.quota.updateOne(
        { storeId, count: { $gte: expired.deletedCount } },
        { $inc: { count: -expired.deletedCount } },
        { session: this.tx.session },
      );
      if (result.matchedCount !== 1)
        throw new Error("Team quota is inconsistent");
    }
  }
  reissue(
    storeId: string,
    id: string,
    version: number,
    tokenHash: string,
    expiresAt: Date,
  ) {
    return this.model
      .findOneAndUpdate(
        { storeId, id, version, status: "invited" },
        { $set: { tokenHash, expiresAt }, $inc: { version: 1 } },
        { session: this.tx.session, returnDocument: "after" },
      )
      .select("-_id")
      .lean()
      .exec();
  }
}
