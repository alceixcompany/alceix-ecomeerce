import { Inject, Injectable, type OnModuleInit } from "@nestjs/common";
import { Schema, type Connection, type Model } from "mongoose";
import { DATABASE, MongoTransactions } from "../../../infrastructure/database";
import type {
  ContactRepository,
  ContactSubmission,
} from "../application/contact.repository";
@Injectable()
export class MongoContactRepository implements ContactRepository, OnModuleInit {
  private readonly model: Model<ContactSubmission>;
  constructor(
    @Inject(DATABASE) db: Connection,
    private readonly tx: MongoTransactions,
  ) {
    const schema = new Schema<ContactSubmission>(
      {
        id: { type: String, required: true, unique: true },
        name: String,
        email: String,
        phone: String,
        store: String,
        topic: String,
        message: String,
        consent: Boolean,
        createdAt: Date,
        status: String,
        version: Number,
        internalNote: String,
      },
      { versionKey: false },
    );
    schema.index({ status: 1, createdAt: -1, id: 1 });
    this.model = db.model("ContactSubmission", schema);
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
  async create(submission: ContactSubmission) {
    await this.model.create(submission);
  }
  find(id: string) {
    return this.model
      .findOne({ id })
      .session(this.tx.session ?? null)
      .select("-_id")
      .lean()
      .exec();
  }
  save(
    id: string,
    version: number,
    input: { status: ContactSubmission["status"]; internalNote: string },
  ) {
    return this.model
      .findOneAndUpdate(
        {
          id,
          ...(version === 0
            ? { $or: [{ version: 0 }, { version: { $exists: false } }] }
            : { version }),
        },
        { $set: input, $inc: { version: 1 } },
        { returnDocument: "after", session: this.tx.session },
      )
      .select("-_id")
      .lean()
      .exec();
  }
}
