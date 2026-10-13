import type { PlatformStaff, AccountControl } from "../domain/platform-access";
import { literalSearch, type PageQuery } from "../../../shared/page";
import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { Schema, type Connection, type Model } from "mongoose";
import { DATABASE, MongoTransactions } from "../../../infrastructure/database";
import type { User } from "../domain/user";
import type { UsersRepository } from "../application/users.repository";
@Injectable()
export class MongoUsersRepository implements UsersRepository, OnModuleInit {
  private readonly model: Model<User>;
  constructor(
    @Inject(DATABASE) db: Connection,
    private readonly tx: MongoTransactions,
  ) {
    const schema = new Schema<User>(
      {
        id: { type: String, required: true, unique: true },
        name: String,
        email: { type: String, required: true, unique: true },
        passwordHash: { type: String, required: true },
        createdAt: Date,
        phone: String,
        city: String,
        bio: String,
        profileVersion: Number,
        emailVerifiedAt: Date,
        phoneVerifiedAt: Date,
        marketing: {
          type: new Schema(
            { email: Boolean, sms: Boolean, version: Number },
            { _id: false },
          ),
        },
        operationsVersion: Number,
        platformStaff: {
          type: new Schema(
            {
              role: String,
              pages: [String],
              write: Boolean,
              status: String,
              version: Number,
            },
            { _id: false },
          ),
        },
        accountControl: {
          type: new Schema(
            {
              status: String,
              verified: Boolean,
              note: String,
              version: Number,
            },
            { _id: false },
          ),
        },
        platformAdmin: { type: Boolean, default: false },
      },
      { versionKey: false },
    );
    this.model = db.model<User>("User", schema);
  }
  async onModuleInit() {
    await this.model.init();
  }
  async create(user: User) {
    await this.model.create([user], { session: this.tx.session });
  }
  async findByEmail(email: string) {
    return this.model
      .findOne({ email })
      .select("-_id")
      .session(this.tx.session ?? null)
      .lean()
      .exec();
  }
  async findById(id: string) {
    return this.model
      .findOne({ id })
      .select("-_id")
      .session(this.tx.session ?? null)
      .lean()
      .exec();
  }
  async saveProfile(
    id: string,
    version: number,
    input: { name: string; phone: string; city: string; bio: string },
  ) {
    return this.model
      .findOneAndUpdate(
        {
          id,
          ...(version === 0
            ? {
                $or: [
                  { profileVersion: 0 },
                  { profileVersion: { $exists: false } },
                ],
              }
            : { profileVersion: version }),
        },
        [
          {
            $set: {
              name: { $literal: input.name },
              phone: { $literal: input.phone },
              city: { $literal: input.city },
              bio: { $literal: input.bio },
              profileVersion: version + 1,
              phoneVerifiedAt: {
                $cond: [
                  { $eq: ["$phone", { $literal: input.phone }] },
                  "$phoneVerifiedAt",
                  "$$REMOVE",
                ],
              },
              "marketing.version": {
                $cond: [
                  { $eq: ["$phone", { $literal: input.phone }] },
                  { $ifNull: ["$marketing.version", 0] },
                  { $add: [{ $ifNull: ["$marketing.version", 0] }, 1] },
                ],
              },
              "marketing.sms": {
                $cond: [
                  { $eq: ["$phone", { $literal: input.phone }] },
                  { $ifNull: ["$marketing.sms", false] },
                  false,
                ],
              },
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
  async setPlatformAdmin(id: string, platformAdmin: boolean) {
    await this.model.updateOne(
      { id },
      { $set: { platformAdmin } },
      { session: this.tx.session },
    );
  }
  async changePassword(id: string, passwordHash: string) {
    await this.model.updateOne(
      { id },
      { $set: { passwordHash } },
      { session: this.tx.session },
    );
  }
  async lock(id: string) {
    const result = await this.model.updateOne(
      { id, "accountControl.status": { $ne: "paused" } },
      { $inc: { operationsVersion: 1 } },
      { session: this.tx.session },
    );
    return result.matchedCount === 1;
  }
  async verifyEmail(id: string) {
    await this.model.updateOne(
      { id },
      { $set: { emailVerifiedAt: new Date() } },
      { session: this.tx.session },
    );
  }
  async list(query: PageQuery, staffOnly: boolean) {
    const filter = {
      ...(staffOnly
        ? {
            $or: [
              { platformAdmin: true },
              {
                "platformStaff.status": { $in: ["active", "paused"] as const },
              },
            ],
          }
        : {}),
      ...(query.q
        ? {
            $and: [
              {
                $or: [
                  { name: { $regex: literalSearch(query.q), $options: "i" } },
                  { email: { $regex: literalSearch(query.q), $options: "i" } },
                ],
              },
            ],
          }
        : {}),
    };
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
        .select("-_id -passwordHash")
        .lean()
        .exec(),
    };
  }
  saveStaff(
    id: string,
    version: number,
    input: Omit<PlatformStaff, "version">,
  ) {
    return this.saveAdministration(id, "platformStaff", version, input);
  }
  saveControl(
    id: string,
    version: number,
    input: Omit<AccountControl, "version">,
  ) {
    return this.saveAdministration(id, "accountControl", version, input);
  }
  private saveAdministration(
    id: string,
    field: "platformStaff" | "accountControl",
    version: number,
    input: object,
  ) {
    const filter = {
      id,
      platformAdmin: { $ne: true },
      ...(version === 0
        ? {
            $or: [
              { [field + ".version"]: 0 },
              { [field + ".version"]: { $exists: false } },
            ],
          }
        : { [field + ".version"]: version }),
    };
    return this.model
      .findOneAndUpdate(
        filter,
        { $set: { [field]: { ...input, version: version + 1 } } },
        { session: this.tx.session, returnDocument: "after" },
      )
      .select("-_id -passwordHash")
      .lean()
      .exec();
  }
  marketing(id: string, version: number, email: boolean, sms: boolean) {
    return this.model
      .findOneAndUpdate(
        {
          id,
          "accountControl.status": { $ne: "paused" },
          ...(email ? { emailVerifiedAt: { $type: "date" } } : {}),
          ...(sms ? { phoneVerifiedAt: { $type: "date" } } : {}),
          ...(version === 0
            ? {
                $or: [
                  { "marketing.version": 0 },
                  { "marketing.version": { $exists: false } },
                ],
              }
            : { "marketing.version": version }),
        },
        { $set: { marketing: { email, sms, version: version + 1 } } },
        { returnDocument: "after", session: this.tx.session },
      )
      .select("-_id")
      .lean()
      .exec();
  }
  async revokeMarketing(id: string) {
    await this.model.updateOne(
      { id },
      {
        $set: { "marketing.email": false, "marketing.sms": false },
        $inc: { "marketing.version": 1 },
      },
      { session: this.tx.session },
    );
  }
  async verifyPhone(id: string, phone: string) {
    const result = await this.model.updateOne(
      { id, phone, "accountControl.status": { $ne: "paused" } },
      { $set: { phoneVerifiedAt: new Date() } },
      { session: this.tx.session },
    );
    return result.matchedCount === 1;
  }
  marketingRecipients(
    channel: "email" | "sms",
    ids: string[],
    after: string,
    before: Date,
  ) {
    return this.model
      .find({
        id: { $in: ids, $gt: after },
        createdAt: { $lte: before },
        "accountControl.status": { $ne: "paused" },
        ["marketing." + channel]: true,
        ...(channel === "email"
          ? { emailVerifiedAt: { $type: "date" } }
          : { phoneVerifiedAt: { $type: "date" } }),
      })
      .sort({ id: 1 })
      .limit(100)
      .select("-_id -passwordHash")
      .lean()
      .exec();
  }

  async lockRecipient(id: string, channel: "email" | "sms" | "whatsapp") {
    const result = await this.model.updateOne(
      {
        id,
        ["marketing." + (channel === "email" ? "email" : "sms")]: true,
        "accountControl.status": { $ne: "paused" },
      },
      { $inc: { operationsVersion: 1 } },
      { session: this.tx.session },
    );
    return result.matchedCount === 1;
  }

  async marketingList(channel: "email" | "sms", query: PageQuery) {
    const filter = {
      ["marketing." + channel]: true,
      "accountControl.status": { $ne: "paused" as const },
      ...(channel === "email"
        ? { emailVerifiedAt: { $type: "date" as const } }
        : { phoneVerifiedAt: { $type: "date" as const } }),
      ...(query.q
        ? { name: { $regex: literalSearch(query.q), $options: "i" } }
        : {}),
    };
    const total = await this.model.countDocuments(filter),
      pages = Math.max(1, Math.ceil(total / query.limit)),
      page = Math.min(query.page, pages);
    return {
      total,
      pages,
      page,
      items: await this.model
        .find(filter)
        .sort({ id: 1 })
        .skip((page - 1) * query.limit)
        .limit(query.limit)
        .select("-_id -passwordHash")
        .lean()
        .exec(),
    };
  }
}
