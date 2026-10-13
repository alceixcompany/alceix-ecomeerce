import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { Schema, type Connection, type Model } from "mongoose";
import { DATABASE, MongoTransactions } from "../../../infrastructure/database";
import type { Store, StoreSettings } from "../domain/store";
import type { StoresRepository } from "../application/stores.repository";
@Injectable()
export class MongoStoresRepository implements StoresRepository, OnModuleInit {
  private readonly model: Model<Store>;
  constructor(
    @Inject(DATABASE) db: Connection,
    private readonly tx: MongoTransactions,
  ) {
    const settings = {
      name: String,
      company: String,
      slug: String,
      bio: String,
      instagram: String,
      tiktok: String,
      whatsapp: String,
      youtube: String,
      seoTitle: String,
      seoDescription: String,
      isOpen: Boolean,
      mode: String,
      bannerImage: String,
      logoImage: String,
      faviconImage: String,
    };
    const schema = new Schema<Store>(
      {
        ...settings,
        id: { type: String, unique: true },
        slug: { type: String, unique: true, required: true },
        ownerId: { type: String, required: true, index: true },
        platformSuspended: Boolean,
        version: Number,
        createdAt: Date,
        draft: new Schema(settings, { _id: false }),
      },
      { versionKey: false },
    );
    this.model = db.model<Store>("Store", schema);
  }
  async onModuleInit() {
    await this.model.init();
  }
  async create(store: Store) {
    await this.model.create([store], { session: this.tx.session });
  }
  async findBySlug(slug: string) {
    return this.model
      .findOne({ slug })
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
  async adminList(q: string, requestedPage: number, limit: number) {
    const filter = q
      ? {
          $or: [
            {
              name: {
                $regex: q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
                $options: "i",
              },
            },
            {
              slug: {
                $regex: q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
                $options: "i",
              },
            },
          ],
        }
      : {};
    const total = await this.model.countDocuments(filter),
      pages = Math.max(1, Math.ceil(total / limit)),
      page = Math.min(requestedPage, pages);
    const items = await this.model
      .find(filter)
      .sort({ createdAt: -1, id: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select("-_id")
      .lean()
      .exec();
    return { items, total, page, pages };
  }
  async ownedBy(ownerId: string) {
    return this.model
      .find({ ownerId })
      .session(this.tx.session ?? null)
      .select("-_id")
      .lean()
      .exec();
  }
  async update(
    id: string,
    version: number,
    settings: StoreSettings,
    draft: boolean,
  ) {
    return this.model
      .findOneAndUpdate(
        { id, version },
        draft
          ? { $set: { draft: settings }, $inc: { version: 1 } }
          : { $set: settings, $unset: { draft: 1 }, $inc: { version: 1 } },
        {
          returnDocument: "after",
          runValidators: true,
          session: this.tx.session,
        },
      )
      .select("-_id")
      .lean()
      .exec();
  }
  async suspendOwner(ownerId: string, suspended: boolean) {
    await this.model.updateMany(
      { ownerId },
      { $set: { platformSuspended: suspended }, $inc: { version: 1 } },
      { session: this.tx.session },
    );
  }
}
