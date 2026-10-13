import { Inject, Injectable, type OnModuleInit } from "@nestjs/common";
import { Schema, type Connection, type Model } from "mongoose";
import { DATABASE, MongoTransactions } from "../../../infrastructure/database";
import type { CouponsRepository } from "../application/coupons.repository";
import type { Coupon, Redemption } from "../domain/coupon";
import type { PageQuery } from "../../../shared/page";
@Injectable()
export class MongoCouponsRepository implements CouponsRepository, OnModuleInit {
  private readonly coupons: Model<Coupon>;
  private readonly redemptions: Model<Redemption>;
  constructor(
    @Inject(DATABASE) db: Connection,
    private readonly tx: MongoTransactions,
  ) {
    const schema = new Schema<Coupon>(
      {
        id: { type: String, unique: true },
        storeId: String,
        code: String,
        allowedBuyerId: String,
        kind: String,
        amount: Number,
        minimumCents: Number,
        limitUses: Number,
        used: Number,
        expiresAt: Date,
        startsAt: Date,
        active: Boolean,
        reusableAfterRefund: Boolean,
        version: Number,
        createdAt: Date,
      },
      { versionKey: false },
    );
    schema.index({ storeId: 1, code: 1 }, { unique: true });
    this.coupons = db.model<Coupon>("Coupon", schema);
    const redemption = new Schema<Redemption>(
      {
        orderId: { type: String, unique: true },
        couponId: String,
        buyerId: String,
        discountCents: Number,
        status: String,
      },
      { versionKey: false },
    );
    redemption.index({ couponId: 1, buyerId: 1, status: 1 });
    this.redemptions = db.model<Redemption>("CouponRedemption", redemption);
  }
  async onModuleInit() {
    await Promise.all([this.coupons.init(), this.redemptions.init()]);
  }
  get(id: string) {
    return this.coupons
      .findOne({ id })
      .session(this.tx.session ?? null)
      .select("-_id")
      .lean()
      .exec();
  }
  byCode(storeId: string, code: string) {
    return this.coupons
      .findOne({ storeId, code })
      .session(this.tx.session ?? null)
      .select("-_id")
      .lean()
      .exec();
  }
  async create(coupon: Coupon) {
    await this.coupons.create([coupon], { session: this.tx.session });
  }
  save(coupon: Coupon, version: number) {
    const { id, version: _v, ...values } = coupon;
    return this.coupons
      .findOneAndUpdate(
        { id, version },
        { $set: values, $inc: { version: 1 } },
        { session: this.tx.session, returnDocument: "after" },
      )
      .select("-_id")
      .lean()
      .exec();
  }
  async list(storeId: string, query: PageQuery) {
    const filter = { storeId };
    const total = await this.coupons.countDocuments(filter),
      pages = Math.max(1, Math.ceil(total / query.limit)),
      page = Math.min(query.page, pages);
    return {
      total,
      pages,
      page,
      items: await this.coupons
        .find(filter)
        .sort({ createdAt: -1, id: 1 })
        .skip((page - 1) * query.limit)
        .limit(query.limit)
        .select("-_id")
        .lean()
        .exec(),
    };
  }
  redemption(orderId: string) {
    return this.redemptions
      .findOne({ orderId })
      .session(this.tx.session ?? null)
      .select("-_id")
      .lean()
      .exec();
  }
  buyerRedemption(couponId: string, buyerId: string) {
    return this.redemptions
      .findOne({
        couponId,
        buyerId,
        status: { $in: ["held", "consumed", "refunded"] },
      })
      .session(this.tx.session ?? null)
      .select("-_id")
      .lean()
      .exec();
  }
  async createRedemption(redemption: Redemption) {
    await this.redemptions.create([redemption], { session: this.tx.session });
  }
  async saveRedemption(redemption: Redemption, status: Redemption["status"]) {
    return (
      (
        await this.redemptions.updateOne(
          { orderId: redemption.orderId, status },
          { $set: redemption },
          { session: this.tx.session },
        )
      ).modifiedCount === 1
    );
  }
}
