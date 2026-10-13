import { Inject, Injectable, type OnModuleInit } from "@nestjs/common";
import { Schema, type Connection, type Model } from "mongoose";
import { DATABASE, MongoTransactions } from "../../../infrastructure/database";
import type { PartnersRepository } from "../application/partners.repository";
import type { Partner, SupplyProduct } from "../domain/partner";
import { literalSearch, type PageQuery } from "../../../shared/page";
@Injectable()
export class MongoPartnersRepository
  implements PartnersRepository, OnModuleInit
{
  private readonly model: Model<Partner>;
  private readonly supply: Model<SupplyProduct>;
  constructor(
    @Inject(DATABASE) db: Connection,
    private readonly tx: MongoTransactions,
  ) {
    const profile = new Schema<Partner>(
      {
        id: { type: String, unique: true },
        ownerId: String,
        accountSuspended: Boolean,
        applicationId: { type: String, unique: true },
        kind: String,
        slug: { type: String, unique: true },
        name: String,
        bio: String,
        city: String,
        category: String,
        logo: String,
        links: [new Schema({ platform: String, url: String }, { _id: false })],
        portfolio: [
          new Schema(
            { id: String, title: String, image: String, url: String },
            { _id: false },
          ),
        ],
        status: String,
        version: Number,
        createdAt: Date,
      },
      { versionKey: false },
    );
    profile.index({ ownerId: 1, kind: 1 }, { unique: true });
    profile.index({ kind: 1, status: 1, createdAt: -1, id: 1 });
    this.model = db.model<Partner>("Partner", profile);
    const product = new Schema<SupplyProduct>(
      {
        id: { type: String, unique: true },
        partnerId: String,
        name: String,
        sku: String,
        category: String,
        description: String,
        priceCents: Number,
        stock: Number,
        reservedStock: Number,
        minimum: Number,
        images: [String],
        active: Boolean,
        version: Number,
        createdAt: Date,
      },
      { versionKey: false },
    );
    product.index({ partnerId: 1, sku: 1 }, { unique: true });
    product.index({ partnerId: 1, active: 1, createdAt: -1, id: 1 });
    this.supply = db.model<SupplyProduct>("SupplyProduct", product);
  }
  async onModuleInit() {
    await Promise.all([this.model.init(), this.supply.init()]);
  }
  find(id: string) {
    return this.model
      .findOne({ id })
      .session(this.tx.session ?? null)
      .select("-_id")
      .lean()
      .exec();
  }
  bySlug(slug: string) {
    return this.model
      .findOne({ slug })
      .session(this.tx.session ?? null)
      .select("-_id")
      .lean()
      .exec();
  }
  byApplication(applicationId: string) {
    return this.model
      .findOne({ applicationId })
      .session(this.tx.session ?? null)
      .select("-_id")
      .lean()
      .exec();
  }
  owned(ownerId: string) {
    return this.model.find({ ownerId }).select("-_id").lean().exec();
  }
  async create(partner: Partner) {
    await this.model.create([partner], { session: this.tx.session });
  }
  save(partner: Partner, version: number) {
    const { id, version: _v, ...values } = partner;
    return this.model
      .findOneAndUpdate(
        { id, version },
        { $set: values, $inc: { version: 1 } },
        { session: this.tx.session, returnDocument: "after" },
      )
      .select("-_id")
      .lean()
      .exec();
  }
  async list(kind: Partner["kind"], query: PageQuery, publicOnly = true) {
    const filter = {
      kind,
      ...(publicOnly
        ? { status: "active" as const, accountSuspended: { $ne: true } }
        : {}),
      ...(query.q
        ? {
            $or: ["name", "category", "city"].map((field) => ({
              [field]: { $regex: literalSearch(query.q), $options: "i" },
            })),
          }
        : {}),
    };
    const total = await this.model.countDocuments(filter),
      pages = Math.max(1, Math.ceil(total / query.limit)),
      page = Math.min(pages, query.page);
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
  async products(partnerId: string, query: PageQuery, publicOnly: boolean) {
    const filter = {
      partnerId,
      ...(publicOnly ? { active: true } : {}),
      ...(query.q
        ? {
            $or: ["name", "sku", "category"].map((field) => ({
              [field]: { $regex: literalSearch(query.q), $options: "i" },
            })),
          }
        : {}),
    };
    const total = await this.supply.countDocuments(filter),
      pages = Math.max(1, Math.ceil(total / query.limit)),
      page = Math.min(pages, query.page);
    return {
      total,
      pages,
      page,
      items: await this.supply
        .find(filter)
        .sort({ createdAt: -1, id: 1 })
        .skip((page - 1) * query.limit)
        .limit(query.limit)
        .select("-_id")
        .lean()
        .exec(),
    };
  }
  product(partnerId: string, id: string) {
    return this.supply
      .findOne({ partnerId, id })
      .session(this.tx.session ?? null)
      .select("-_id")
      .lean()
      .exec();
  }
  async createProduct(product: SupplyProduct) {
    await this.supply.create([product], { session: this.tx.session });
  }
  saveProduct(product: SupplyProduct, version: number) {
    const { id, partnerId, version: _v, ...values } = product;
    return this.supply
      .findOneAndUpdate(
        {
          id,
          partnerId,
          version,
          $expr: {
            $lte: [{ $add: [product.stock, "$reservedStock"] }, 9999999],
          },
        },
        { $set: values, $inc: { version: 1 } },
        { session: this.tx.session, returnDocument: "after" },
      )
      .select("-_id")
      .lean()
      .exec();
  }
  reserve(partnerId: string, id: string, quantity: number) {
    return this.supply
      .findOneAndUpdate(
        {
          partnerId,
          id,
          active: true,
          stock: { $gte: quantity },
          minimum: { $lte: quantity },
        },
        { $inc: { stock: -quantity, reservedStock: quantity, version: 1 } },
        { session: this.tx.session, returnDocument: "after" },
      )
      .select("-_id")
      .lean()
      .exec();
  }
  release(partnerId: string, id: string, quantity: number) {
    return this.supply
      .findOneAndUpdate(
        { partnerId, id, reservedStock: { $gte: quantity } },
        { $inc: { stock: quantity, reservedStock: -quantity, version: 1 } },
        { session: this.tx.session, returnDocument: "after" },
      )
      .select("-_id")
      .lean()
      .exec();
  }
  consume(partnerId: string, id: string, quantity: number) {
    return this.supply
      .findOneAndUpdate(
        { partnerId, id, reservedStock: { $gte: quantity } },
        { $inc: { reservedStock: -quantity, version: 1 } },
        { session: this.tx.session, returnDocument: "after" },
      )
      .select("-_id")
      .lean()
      .exec();
  }
  async suspendOwner(ownerId: string, suspended: boolean) {
    await this.model.updateMany(
      { ownerId },
      { $set: { accountSuspended: suspended }, $inc: { version: 1 } },
      { session: this.tx.session },
    );
  }
}
