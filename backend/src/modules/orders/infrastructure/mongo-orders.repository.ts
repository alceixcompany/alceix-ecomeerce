import { Inject, Injectable, type OnModuleInit } from "@nestjs/common";
import { Schema, type Model, type Connection } from "mongoose";
import { DATABASE, MongoTransactions } from "../../../infrastructure/database";
import type { OrdersRepository } from "../application/orders.repository";
import type { Order, OrderQuery, DailySale } from "../domain/order";
@Injectable()
export class MongoOrdersRepository implements OrdersRepository, OnModuleInit {
  private readonly model: Model<Order>;
  constructor(
    @Inject(DATABASE) db: Connection,
    private readonly tx: MongoTransactions,
  ) {
    const schema = new Schema<Order>(
      {
        id: { type: String, unique: true },
        storeId: String,
        buyerId: String,
        createdBy: String,
        requestId: String,
        initialInput: { type: Schema.Types.Mixed },
        version: Number,
        createdAt: Date,
        expiresAt: Date,
        customer: String,
        email: String,
        phone: String,
        address: String,
        city: String,
        customerNote: String,
        internalNote: String,
        carrier: String,
        tracking: String,
        currency: String,
        discountCents: Number,
        shippingCents: Number,
        totalCents: Number,
        commissionBasisPoints: Number,
        returnDays: Number,
        pricingVersion: Number,
        pricingComplete: Boolean,
        checkoutLocked: Boolean,
        paidAt: Date,
        deliveredAt: Date,
        settleAt: Date,
        financialState: String,
        payment: String,
        shipment: String,
        reservation: String,
        cancellationReason: String,
        items: [
          new Schema(
            {
              productId: String,
              name: String,
              sku: String,
              variant: String,
              variantId: String,
              image: String,
              quantity: Number,
              unitCents: Number,
            },
            { _id: false },
          ),
        ],
      },
      { versionKey: false },
    );
    schema.index({ storeId: 1, createdBy: 1, requestId: 1 }, { unique: true });
    schema.index({ storeId: 1, createdAt: -1, id: 1 });
    schema.index({ storeId: 1, buyerId: 1, createdAt: -1, id: 1 });
    schema.index({ storeId: 1, buyerId: 1, reservation: 1, expiresAt: 1 });
    schema.index({ storeId: 1, payment: 1, paidAt: 1 });
    schema.index({ payment: 1, paidAt: 1 });
    schema.index({ reservation: 1, expiresAt: 1, id: 1 });
    this.model = db.model("Order", schema);
  }
  async onModuleInit() {
    await this.model.init();
  }
  held(storeId: string, buyerId: string) {
    return this.model
      .countDocuments({
        storeId,
        buyerId,
        reservation: "held",
        expiresAt: { $gt: new Date() },
      })
      .session(this.tx.session ?? null)
      .exec();
  }
  async summary(storeId: string) {
    const [summary] = await this.model.aggregate<{
      total: number;
      pending: number;
      cancelled: number;
    }>([
      { $match: { storeId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: {
            $sum: { $cond: [{ $eq: ["$reservation", "held"] }, 1, 0] },
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ["$shipment", "cancelled"] }, 1, 0] },
          },
        },
      },
      { $project: { _id: 0 } },
    ]);
    return summary ?? { total: 0, pending: 0, cancelled: 0 };
  }
  async create(order: Order) {
    await this.model.create([order], { session: this.tx.session });
  }
  find(storeId: string, id: string) {
    return this.model
      .findOne({ storeId, id })
      .session(this.tx.session ?? null)
      .select("-_id")
      .lean()
      .exec();
  }
  byRequest(storeId: string, createdBy: string, requestId: string) {
    return this.model
      .findOne({ storeId, createdBy, requestId })
      .session(this.tx.session ?? null)
      .select("-_id")
      .lean()
      .exec();
  }
  async list(storeId: string | undefined, query: OrderQuery, buyerId?: string) {
    const base = {
      ...(storeId ? { storeId } : {}),
      ...(buyerId ? { buyerId } : {}),
    };
    const filter = {
      ...base,
      ...(query.tab !== "all" && query.tab !== "requests"
        ? { shipment: query.tab }
        : query.tab !== "all"
          ? { financialState: "refundPending" as const }
          : {}),
      ...(query.carrier !== "all" ? { carrier: query.carrier } : {}),
      ...(query.period !== "all"
        ? {
            createdAt: {
              $gte: new Date(Date.now() - Number(query.period) * 86400000),
            },
          }
        : {}),
      ...(query.q
        ? {
            $or: ["id", "customer", "city", "tracking", "items.name"].map(
              (field) => ({
                [field]: {
                  $regex: query.q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
                  $options: "i",
                },
              }),
            ),
          }
        : {}),
    };
    const total = await this.model.countDocuments(filter),
      pages = Math.max(1, Math.ceil(total / query.limit)),
      page = Math.min(query.page, pages);
    const items = await this.model
      .find(filter)
      .sort({ createdAt: -1, id: 1 })
      .skip((page - 1) * query.limit)
      .limit(query.limit)
      .select("-_id")
      .lean()
      .exec();
    const groups = await this.model.aggregate<{
      _id: string;
      count: number;
      requests: number;
    }>([
      { $match: base },
      {
        $group: {
          _id: "$shipment",
          count: { $sum: 1 },
          requests: {
            $sum: {
              $cond: [{ $eq: ["$financialState", "refundPending"] }, 1, 0],
            },
          },
        },
      },
    ]);
    const counts: Record<string, number> = {
      all: 0,
      preparing: 0,
      cancelled: 0,
      shipped: 0,
      delivered: 0,
      requests: 0,
    };
    for (const group of groups) {
      counts[group._id] = group.count;
      counts.all += group.count;
      counts.requests += group.requests;
    }
    return { items, total, page, pages, counts };
  }
  save(order: Order, version: number) {
    const { id, storeId, version: _version, ...values } = order;
    return this.model
      .findOneAndUpdate(
        { id, storeId, version },
        { $set: values, $inc: { version: 1 } },
        { returnDocument: "after", session: this.tx.session },
      )
      .select("-_id")
      .lean()
      .exec();
  }
  expired(now: Date, limit: number) {
    return this.model
      .find({
        reservation: "held",
        payment: "pending",
        expiresAt: { $lte: now },
      })
      .sort({ expiresAt: 1, id: 1 })
      .limit(limit)
      .select("-_id")
      .lean()
      .exec();
  }
  settledReady(now: Date) {
    return this.model
      .find({
        payment: "paid",
        shipment: "delivered",
        financialState: "pending",
        settleAt: { $lte: now },
      })
      .sort({ settleAt: 1, id: 1 })
      .limit(100)
      .select("-_id")
      .lean()
      .exec();
  }
  async dailySales(
    storeId: string | undefined,
    start: Date,
    end: Date,
  ): Promise<DailySale[]> {
    const rows = await this.model.aggregate<{
      _id: string;
      orders: number;
      gross: unknown;
      refunded: unknown;
    }>([
      {
        $match: {
          ...(storeId ? { storeId } : {}),
          payment: { $in: ["paid", "refunded"] },
          paidAt: { $gte: start, $lt: end },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              date: "$paidAt",
              format: "%Y-%m-%d",
              timezone: "UTC",
            },
          },
          orders: { $sum: 1 },
          gross: { $sum: { $toDecimal: "$totalCents" } },
          refunded: {
            $sum: {
              $cond: [
                { $eq: ["$payment", "refunded"] },
                { $toDecimal: "$totalCents" },
                0,
              ],
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    return rows.map((row) => {
      const grossCents = Number(String(row.gross)),
        refundedCents = Number(String(row.refunded));
      if (
        ![grossCents, refundedCents, grossCents - refundedCents].every(
          Number.isSafeInteger,
        )
      )
        throw new Error("Sales exceeds supported range");
      return {
        date: row._id,
        orders: row.orders,
        grossCents,
        refundedCents,
        netCents: grossCents - refundedCents,
      };
    });
  }
  async sales(storeId?: string) {
    const rows = await this.model.aggregate<{
      paidOrders: number;
      refundedOrders: number;
      paidCents: unknown;
      refundedCents: unknown;
    }>([
      {
        $match: {
          ...(storeId ? { storeId } : {}),
          payment: { $in: ["paid", "refunded"] },
        },
      },
      {
        $group: {
          _id: null,
          paidOrders: {
            $sum: { $cond: [{ $eq: ["$payment", "paid"] }, 1, 0] },
          },
          refundedOrders: {
            $sum: { $cond: [{ $eq: ["$payment", "refunded"] }, 1, 0] },
          },
          paidCents: {
            $sum: {
              $cond: [
                { $eq: ["$payment", "paid"] },
                { $toDecimal: "$totalCents" },
                0,
              ],
            },
          },
          refundedCents: {
            $sum: {
              $cond: [
                { $eq: ["$payment", "refunded"] },
                { $toDecimal: "$totalCents" },
                0,
              ],
            },
          },
        },
      },
    ]);
    const paidCents = Number(String(rows[0]?.paidCents ?? 0)),
      refundedCents = Number(String(rows[0]?.refundedCents ?? 0));
    if (![paidCents, refundedCents].every(Number.isSafeInteger))
      throw new Error("Sales total exceeds supported range");
    return {
      currency: "TRY" as const,
      paidOrders: rows[0]?.paidOrders ?? 0,
      refundedOrders: rows[0]?.refundedOrders ?? 0,
      paidCents,
      refundedCents,
    };
  }
}
