import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import {
  Schema,
  type Model,
  type Connection,
  type QueryFilter,
} from "mongoose";
import { DATABASE, MongoTransactions } from "../../../infrastructure/database";
import { normalize, type Product, type Category } from "../domain/product";
import type { CatalogRepository } from "../application/catalog.repository";
import type { ListQuery } from "../domain/list-query";
const escaped = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
@Injectable()
export class MongoCatalogRepository implements CatalogRepository, OnModuleInit {
  private readonly products: Model<Product>;
  private readonly categoryModel: Model<Category>;
  constructor(
    @Inject(DATABASE) db: Connection,
    private readonly tx: MongoTransactions,
  ) {
    const schema = new Schema<Product>(
      {
        id: { type: String, unique: true },
        storeId: { type: String, required: true },
        name: String,
        category: String,
        categoryId: String,
        description: String,
        sku: String,
        barcode: String,
        priceCents: Number,
        costCents: Number,
        currency: String,
        stock: Number,
        variants: [String],
        images: [String],
        status: String,
        model: String,
        seoTitle: String,
        seoDescription: String,
        version: Number,
        createdAt: Date,
      },
      { versionKey: false },
    );
    schema.index(
      { storeId: 1, sku: 1 },
      { unique: true, collation: { locale: "tr", strength: 2 } },
    );
    schema.index({ storeId: 1, status: 1, createdAt: -1, id: 1 });
    schema.index({ storeId: 1, category: 1, priceCents: 1 });
    schema.index({ storeId: 1, stock: 1 });
    schema.index({ storeId: 1, status: 1, priceCents: 1, id: 1 });
    schema.index({ storeId: 1, status: 1, name: 1, id: 1 });
    const category = new Schema<Category>(
      {
        id: { type: String, unique: true },
        storeId: String,
        name: String,
        key: String,
      },
      { versionKey: false },
    );
    category.index({ storeId: 1, key: 1 }, { unique: true });
    this.products = db.model<Product>("Product", schema);
    this.categoryModel = db.model<Category>("Category", category);
    const movement = new Schema(
      {
        id: { type: String, unique: true },
        storeId: String,
        productId: String,
        amount: Number,
        reason: String,
        createdAt: Date,
      },
      { versionKey: false },
    );
    movement.index({ storeId: 1, productId: 1, createdAt: -1 });
    db.model("StockMovement", movement);
  }
  async onModuleInit() {
    await this.products.init();
    await this.categoryModel.init();
    await this.products.db.models.StockMovement.init();
  }
  async list(storeId: string, query: ListQuery, publicOnly: boolean) {
    const base: QueryFilter<Product> = {
        storeId,
        ...(publicOnly ? { status: "live" } : {}),
      },
      filter: QueryFilter<Product> = { ...base };
    if (!publicOnly && query.status === "critical") filter.stock = { $lte: 5 };
    else if (
      !publicOnly &&
      (query.status === "live" || query.status === "draft")
    )
      filter.status = query.status;
    if (query.availability !== "all") {
      const stock = query.availability === "in-stock" ? { $gt: 0 } : { $eq: 0 };
      filter.stock = {
        ...(typeof filter.stock === "object" ? filter.stock : {}),
        ...stock,
      };
    }
    if (query.model !== "all") filter.model = query.model;
    if (query.category !== "all") filter.category = query.category;
    if (query.q) {
      const regex = new RegExp(escaped(query.q), "i");
      filter.$or = ["name", "sku", "barcode", "category"].map((key) => ({
        [key]: regex,
      }));
    }
    if (query.min !== undefined || query.max !== undefined)
      filter.priceCents = {
        ...(query.min !== undefined ? { $gte: query.min } : {}),
        ...(query.max !== undefined ? { $lte: query.max } : {}),
      };
    // One scoped aggregation calculates facets, instead of five independent count scans.
    const facets = await this.products.aggregate<{
      totals: { value: number }[];
      counts: { all: number; live: number; draft: number; critical: number }[];
      groups: { _id: string; count: number }[];
    }>([
      { $match: base },
      {
        $facet: {
          totals: [{ $match: filter }, { $count: "value" }],
          counts: [
            {
              $group: {
                _id: null,
                all: { $sum: 1 },
                live: { $sum: { $cond: [{ $eq: ["$status", "live"] }, 1, 0] } },
                draft: {
                  $sum: { $cond: [{ $eq: ["$status", "draft"] }, 1, 0] },
                },
                critical: { $sum: { $cond: [{ $lte: ["$stock", 5] }, 1, 0] } },
              },
            },
          ],
          groups: [
            { $group: { _id: "$category", count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
          ],
        },
      },
    ]);
    const facet = facets[0],
      total = facet.totals[0]?.value ?? 0;
    const pageCount = Math.max(1, Math.ceil(total / query.limit)),
      page = Math.min(query.page, pageCount);
    const sort: Record<string, 1 | -1> =
      query.sort === "price-asc"
        ? { priceCents: 1, id: 1 }
        : query.sort === "price-desc"
          ? { priceCents: -1, id: 1 }
          : query.sort === "stock"
            ? { stock: 1, id: 1 }
            : query.sort === "name"
              ? { name: 1, id: 1 }
              : { createdAt: -1, id: 1 };
    const [items, categories] = await Promise.all([
      this.products
        .find(filter)
        .select(
          publicOnly
            ? "id name category description priceCents currency images stock -_id"
            : "-_id",
        )
        .sort(sort)
        .skip((page - 1) * query.limit)
        .limit(query.limit)
        .lean()
        .exec(),
      publicOnly
        ? Promise.resolve(facet.groups.map((group) => group._id))
        : this.categoryModel.distinct("name", { storeId }),
    ]);
    const {
      all = 0,
      live = 0,
      draft = 0,
      critical = 0,
    } = facet.counts[0] ?? {};
    const categoryCounts = Object.fromEntries(
      facet.groups.map((group) => [group._id, group.count]),
    );
    return {
      items,
      total,
      page,
      pageCount,
      categoryCounts,
      counts: { all, live, draft, critical },
      categories,
    };
  }
  async byId(storeId: string, id: string) {
    return this.products
      .findOne({ storeId, id })
      .select("-_id")
      .session(this.tx.session ?? null)
      .lean()
      .exec();
  }
  async create(product: Product) {
    await this.products.create([product], { session: this.tx.session });
    if (product.stock > 0)
      await this.movement(product, product.stock, "initial");
  }
  async update(product: Product, expectedVersion: number) {
    const { version: _version, ...values } = product;
    const existing = await this.byId(product.storeId, product.id);
    const result = await this.products
      .findOneAndUpdate(
        { storeId: product.storeId, id: product.id, version: expectedVersion },
        { $set: values, $inc: { version: 1 } },
        { returnDocument: "after", session: this.tx.session },
      )
      .select("-_id")
      .lean()
      .exec();
    if (result && existing && existing.stock !== result.stock)
      await this.movement(result, result.stock - existing.stock, "editor");
    return result;
  }
  private async movement(product: Product, amount: number, reason: string) {
    await this.products.db.models.StockMovement.create(
      [
        {
          id: randomUUID(),
          storeId: product.storeId,
          productId: product.id,
          amount,
          reason,
          createdAt: new Date(),
        },
      ],
      { session: this.tx.session },
    );
  }
  async adjustStock(storeId: string, id: string, amount: number) {
    return this.tx.run(async () => {
      const result = await this.products
        .findOneAndUpdate(
          {
            storeId,
            id,
            stock:
              amount < 0 ? { $gte: -amount } : { $lte: 9_999_999 - amount },
          },
          { $inc: { stock: amount, version: 1 } },
          { returnDocument: "after", session: this.tx.session },
        )
        .select("-_id")
        .lean()
        .exec();
      if (result) await this.movement(result, amount, "manual");
      return result;
    });
  }
  async ensureCategory(storeId: string, name: string) {
    const key = normalize(name);
    return (await this.categoryModel
      .findOneAndUpdate(
        { storeId, key },
        { $setOnInsert: { id: randomUUID(), storeId, name, key } },
        { upsert: true, returnDocument: "after", session: this.tx.session },
      )
      .select("-_id")
      .lean()
      .exec())!;
  }
  async categories(storeId: string) {
    return this.categoryModel
      .find({ storeId })
      .select("-_id")
      .sort({ name: 1 })
      .lean()
      .exec();
  }
}
