import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { conflict } from "../../../shared/errors";
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
  private readonly claims: Model<{
    storeId: string;
    sku: string;
    productId: string;
  }>;
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
        reservedStock: { type: Number, default: 0 },
        variants: [String],
        options: {
          type: [
            new Schema(
              {
                id: String,
                name: String,
                sku: String,
                priceCents: Number,
                stock: Number,
                reservedStock: Number,
              },
              { _id: false },
            ),
          ],
          default: undefined,
        },
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
    const claims = new Schema<{
      storeId: string;
      sku: string;
      productId: string;
    }>(
      { storeId: String, sku: String, productId: String },
      { versionKey: false },
    );
    claims.index(
      { storeId: 1, sku: 1 },
      { unique: true, collation: { locale: "tr", strength: 2 } },
    );
    this.claims = db.model<{ storeId: string; sku: string; productId: string }>(
      "SkuClaim",
      claims,
    );
    this.categoryModel = db.model<Category>("Category", category);
    const movement = new Schema(
      {
        id: { type: String, unique: true },
        storeId: String,
        productId: String,
        amount: Number,
        reason: String,
        requestId: String,
        actorId: String,
        variant: String,
        createdAt: Date,
      },
      { versionKey: false },
    );
    movement.index({ storeId: 1, productId: 1, createdAt: -1 });
    movement.index(
      { storeId: 1, actorId: 1, requestId: 1 },
      {
        unique: true,
        partialFilterExpression: { requestId: { $type: "string" } },
      },
    );
    db.model("StockMovement", movement);
  }
  async onModuleInit() {
    await this.products.init();
    await this.claims.init();
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
            ? "id name category description priceCents currency images stock variants options.id options.name options.priceCents options.stock -_id"
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
        {
          storeId: product.storeId,
          id: product.id,
          version: expectedVersion,
          $expr: {
            $lte: [
              { $add: [product.stock, { $ifNull: ["$reservedStock", 0] }] },
              9_999_999,
            ],
          },
        },
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
  private async movement(
    product: Product,
    amount: number,
    reason: string,
    requestId?: string,
    actorId?: string,
    variant?: string,
  ) {
    await this.products.db.models.StockMovement.create(
      [
        {
          id: randomUUID(),
          storeId: product.storeId,
          productId: product.id,
          amount,
          reason,
          requestId,
          actorId,
          variant,
          createdAt: new Date(),
        },
      ],
      { session: this.tx.session },
    );
  }
  async adjustStock(
    storeId: string,
    id: string,
    amount: number,
    variant?: string,
    requestId?: string,
    actorId?: string,
  ) {
    return this.tx.run(async () => {
      if (requestId) {
        const previous = await this.products.db.models.StockMovement.findOne({
          storeId,
          actorId,
          requestId,
        })
          .session(this.tx.session ?? null)
          .lean();
        if (previous) {
          if (
            previous.productId !== id ||
            previous.amount !== amount ||
            (previous.variant ?? "") !== (variant ?? "")
          )
            throw conflict("Stok istek kimliği farklı içerikle kullanılmış.");
          return this.byId(storeId, id);
        }
      }
      const current = await this.byId(storeId, id);
      if (!current) return null;
      const option = current.options?.find((o) => o.id === variant);
      if (current.options?.length && !option)
        throw conflict("Varyant stok değişimi için varyant kimliği seçin.");
      const filter = {
        storeId,
        id,
        version: current.version,
        stock: amount < 0 ? { $gte: -amount } : { $lte: 9999999 - amount },
        $expr: {
          $lte: [
            { $add: ["$stock", { $ifNull: ["$reservedStock", 0] }, amount] },
            9999999,
          ],
        },
        ...(option
          ? {
              options: {
                $elemMatch: {
                  id: option.id,
                  ...(amount < 0 ? { stock: { $gte: -amount } } : {}),
                },
              },
            }
          : {}),
      };
      const inc: Record<string, number> = { stock: amount, version: 1 };
      if (option) inc["options.$.stock"] = amount;
      const result = await this.products
        .findOneAndUpdate(
          filter,
          { $inc: inc },
          { returnDocument: "after", session: this.tx.session },
        )
        .select("-_id")
        .lean()
        .exec();
      if (result)
        await this.movement(
          result,
          amount,
          "manual",
          requestId,
          actorId,
          variant,
        );
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

  async claimSkus(storeId: string, productId: string, skus: string[]) {
    const other = await this.products
      .exists({
        storeId,
        id: { $ne: productId },
        $or: [{ sku: { $in: skus } }, { "options.sku": { $in: skus } }],
      })
      .collation({ locale: "tr", strength: 2 })
      .session(this.tx.session ?? null);
    if (other) return false;
    for (const sku of skus) {
      const claim = await this.claims
        .findOneAndUpdate(
          { storeId, sku },
          { $setOnInsert: { storeId, sku, productId } },
          {
            upsert: true,
            returnDocument: "after",
            session: this.tx.session,
            collation: { locale: "tr", strength: 2 },
          },
        )
        .lean();
      if (claim?.productId !== productId) return false;
    }
    return true;
  }
  private async inventory(
    storeId: string,
    id: string,
    quantity: number,
    kind: "reserve" | "release" | "consume" | "restock",
    variant?: string,
  ) {
    const current = await this.byId(storeId, id);
    if (!current) return null;
    const option = current.options?.find(
      (o) => o.id === variant || o.name === variant,
    );
    if (current.options?.length && !option) return null;
    const stockDelta =
        kind === "reserve" ? -quantity : kind === "consume" ? 0 : quantity,
      reservedDelta =
        kind === "reserve" ? quantity : kind === "restock" ? 0 : -quantity;
    const filter = {
      storeId,
      id,
      version: current.version,
      ...(kind === "reserve"
        ? { status: "live" as const, stock: { $gte: quantity } }
        : kind !== "restock"
          ? { reservedStock: { $gte: quantity } }
          : {}),
      ...(kind === "restock" || kind === "release"
        ? {
            $expr: {
              $lte: [
                {
                  $add: [
                    "$stock",
                    { $ifNull: ["$reservedStock", 0] },
                    kind === "restock" ? quantity : 0,
                  ],
                },
                9999999,
              ],
            },
          }
        : {}),
      ...(option
        ? {
            options: {
              $elemMatch: {
                id: option.id,
                ...(kind === "reserve"
                  ? { stock: { $gte: quantity } }
                  : kind !== "restock"
                    ? { reservedStock: { $gte: quantity } }
                    : {}),
              },
            },
          }
        : {}),
    };
    const inc: Record<string, number> = {
      stock: stockDelta,
      reservedStock: reservedDelta,
      version: 1,
    };
    if (option) {
      inc["options.$.stock"] = stockDelta;
      inc["options.$.reservedStock"] = reservedDelta;
    }
    const result = await this.products
      .findOneAndUpdate(
        filter,
        { $inc: inc },
        { returnDocument: "after", session: this.tx.session },
      )
      .select("-_id")
      .lean()
      .exec();
    if (result)
      await this.movement(
        result,
        stockDelta,
        {
          reserve: "reservation",
          release: "reservation-release",
          consume: "sale",
          restock: "return",
        }[kind],
      );
    return result;
  }
  reserve(storeId: string, id: string, quantity: number, variant?: string) {
    return this.inventory(storeId, id, quantity, "reserve", variant);
  }
  release(storeId: string, id: string, quantity: number, variant?: string) {
    return this.inventory(storeId, id, quantity, "release", variant);
  }
  consume(storeId: string, id: string, quantity: number, variant?: string) {
    return this.inventory(storeId, id, quantity, "consume", variant);
  }
  restock(storeId: string, id: string, quantity: number, variant?: string) {
    return this.inventory(storeId, id, quantity, "restock", variant);
  }
}
