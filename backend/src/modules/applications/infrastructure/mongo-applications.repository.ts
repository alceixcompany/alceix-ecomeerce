import { Injectable, Inject, OnModuleInit } from "@nestjs/common";
import { Schema, type Connection, type Model } from "mongoose";
import { DATABASE, MongoTransactions } from "../../../infrastructure/database";
import type {
  ApplicationsRepository,
  Application,
} from "../application/applications.repository";
@Injectable()
export class MongoApplicationsRepository
  implements ApplicationsRepository, OnModuleInit
{
  private readonly model: Model<Application>;
  constructor(
    @Inject(DATABASE) db: Connection,
    private readonly tx: MongoTransactions,
  ) {
    const schema = new Schema<Application>(
      {
        id: { type: String, unique: true },
        type: String,
        status: String,
        ownerId: String,
        version: { type: Number, default: 0 },
        decisionReason: String,
        decidedBy: String,
        decidedAt: Date,
        payload: { type: Map, of: String },
        createdAt: Date,
      },
      { versionKey: false },
    );
    schema.index({ type: 1, status: 1, createdAt: -1 });
    this.model = db.model<Application>("Application", schema);
  }
  async onModuleInit() {
    await this.model.init();
  }
  async list(requestedPage: number, limit: number) {
    const total = await this.model.countDocuments(),
      pages = Math.max(1, Math.ceil(total / limit)),
      page = Math.min(requestedPage, pages);
    const items = await this.model
      .find()
      .sort({ createdAt: -1, id: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select("-_id")
      .lean()
      .exec();
    return { items, total, page, pages };
  }
  find(id: string) {
    return this.model
      .findOne({ id })
      .session(this.tx.session ?? null)
      .select("-_id")
      .lean()
      .exec();
  }
  owned(ownerId: string) {
    return this.model
      .find({ ownerId })
      .sort({ createdAt: -1, id: 1 })
      .limit(100)
      .select("-_id")
      .lean()
      .exec();
  }
  save(application: Application, version: number) {
    const { id, version: _v, ...values } = application;
    return this.model
      .findOneAndUpdate(
        {
          id,
          $or: [
            { version },
            ...(version === 0 ? [{ version: { $exists: false } }] : []),
          ],
        },
        { $set: values, $inc: { version: 1 } },
        { session: this.tx.session, returnDocument: "after" },
      )
      .select("-_id")
      .lean()
      .exec();
  }
  async create(application: Application) {
    await this.model.create([application], { session: this.tx.session });
  }
}
