import { Inject, Injectable, type OnModuleInit } from "@nestjs/common";
import { Schema, type Connection, type Model } from "mongoose";
import { DATABASE, MongoTransactions } from "../../../infrastructure/database";
import type { WholesaleRepository } from "../application/wholesale.repository";
import type { WholesaleOrder, ImportReceipt } from "../domain/wholesale";
import type { PageQuery } from "../../../shared/page";
@Injectable()
export class MongoWholesaleRepository
  implements WholesaleRepository, OnModuleInit
{
  private readonly model: Model<WholesaleOrder>;
  private readonly imports: Model<ImportReceipt>;
  constructor(
    @Inject(DATABASE) db: Connection,
    private readonly tx: MongoTransactions,
  ) {
    const schema = new Schema<WholesaleOrder>(
      {
        id: { type: String, unique: true },
        storeId: String,
        partnerId: String,
        productId: String,
        actorId: String,
        quantity: Number,
        maxTotalCents: Number,
        unitCents: Number,
        totalCents: Number,
        sku: String,
        name: String,
        image: String,
        address: String,
        city: String,
        phone: String,
        customer: String,
        status: String,
        shipmentId: String,
        tracking: String,
        commissionBasisPoints: Number,
        returnDays: Number,
        settleAt: Date,
        settled: Boolean,
        version: Number,
        createdAt: Date,
      },
      { versionKey: false },
    );
    schema.index({ storeId: 1, createdAt: -1, id: 1 });
    schema.index({ partnerId: 1, createdAt: -1, id: 1 });
    this.model = db.model<WholesaleOrder>("WholesaleOrder", schema);
    this.imports = db.model<ImportReceipt>(
      "SupplyImport",
      new Schema<ImportReceipt>(
        {
          id: { type: String, unique: true },
          storeId: String,
          partnerId: String,
          productId: String,
          retailProductId: String,
          priceCents: Number,
        },
        { versionKey: false },
      ),
    );
  }
  async onModuleInit() {
    await Promise.all([this.model.init(), this.imports.init()]);
  }
  find(id: string) {
    return this.model
      .findOne({ id })
      .session(this.tx.session ?? null)
      .select("-_id")
      .lean()
      .exec();
  }
  shipment(shipmentId: string) {
    return this.model
      .findOne({ shipmentId })
      .session(this.tx.session ?? null)
      .select("-_id")
      .lean()
      .exec();
  }
  async create(order: WholesaleOrder) {
    await this.model.create([order], { session: this.tx.session });
  }
  save(order: WholesaleOrder, version: number) {
    const { id, version: _v, ...values } = order;
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
  async list(
    scope: { storeId?: string; partnerId?: string },
    query: PageQuery,
  ) {
    const total = await this.model.countDocuments(scope),
      pages = Math.max(1, Math.ceil(total / query.limit)),
      page = Math.min(query.page, pages);
    return {
      total,
      pages,
      page,
      items: await this.model
        .find(scope)
        .sort({ createdAt: -1, id: 1 })
        .skip((page - 1) * query.limit)
        .limit(query.limit)
        .select("-_id")
        .lean()
        .exec(),
    };
  }
  ready() {
    return this.model
      .find({
        status: "delivered",
        settled: false,
        settleAt: { $lte: new Date() },
      })
      .sort({ settleAt: 1, id: 1 })
      .limit(100)
      .select("-_id")
      .lean()
      .exec();
  }
  importReceipt(id: string) {
    return this.imports
      .findOne({ id })
      .session(this.tx.session ?? null)
      .select("-_id")
      .lean()
      .exec();
  }
  async createImport(receipt: ImportReceipt) {
    await this.imports.create([receipt], { session: this.tx.session });
  }
}
