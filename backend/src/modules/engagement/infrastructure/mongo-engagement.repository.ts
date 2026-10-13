import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { Schema, type Connection, type Model } from "mongoose";
import { DATABASE, MongoTransactions } from "../../../infrastructure/database";
import type {
  Cart,
  CartLine,
  EngagementRepository,
} from "../application/engagement.repository";
type Follow = { storeId: string; userId: string };
@Injectable()
export class MongoEngagementRepository
  implements EngagementRepository, OnModuleInit
{
  private readonly carts: Model<Cart>;
  private readonly follows: Model<Follow>;
  constructor(
    @Inject(DATABASE) db: Connection,
    private readonly tx: MongoTransactions,
  ) {
    const cart = new Schema<Cart>(
      {
        hash: String,
        storeId: String,
        lines: [
          { _id: false, productId: String, quantity: Number, variant: String },
        ],
        buyerId: String,
        email: String,
        version: Number,
        expiresAt: { type: Date, expires: 0 },
      },
      { versionKey: false },
    );
    cart.index({ hash: 1, storeId: 1 }, { unique: true });
    const follow = new Schema<Follow>(
      { storeId: String, userId: String },
      { versionKey: false },
    );
    follow.index({ storeId: 1, userId: 1 }, { unique: true });
    this.carts = db.model<Cart>("Cart", cart);
    this.follows = db.model<Follow>("Follow", follow);
  }
  async onModuleInit() {
    await this.carts.init();
    await this.follows.init();
  }
  async cart(hash: string, storeId: string) {
    // Check expiry ourselves; MongoDB TTL cleanup is asynchronous.
    await this.carts.deleteOne(
      {
        hash,
        storeId,
        expiresAt: { $lte: new Date() },
      },
      { session: this.tx.session },
    );
    return (await this.carts
      .findOneAndUpdate(
        { hash, storeId },
        {
          $setOnInsert: { lines: [], version: 0 },
          $set: { expiresAt: new Date(Date.now() + 30 * 86400000) },
        },
        { upsert: true, returnDocument: "after", session: this.tx.session },
      )
      .select("-_id")
      .lean()
      .exec())!;
  }
  async saveCart(
    hash: string,
    storeId: string,
    lines: CartLine[],
    version: number,
    identity?: { buyerId: string; email: string },
  ) {
    return this.carts
      .findOneAndUpdate(
        { hash, storeId, version, expiresAt: { $gt: new Date() } },
        {
          $set: { lines, ...(identity ?? {}) },
          ...(identity ? {} : { $unset: { buyerId: 1, email: 1 } }),
          $inc: { version: 1 },
        },
        { returnDocument: "after", session: this.tx.session },
      )
      .select("-_id")
      .lean()
      .exec();
  }
  async followed(storeId: string, userId: string) {
    return !!(await this.follows.exists({ storeId, userId }));
  }
  async follow(storeId: string, userId: string, enabled: boolean) {
    if (enabled)
      await this.follows.updateOne(
        { storeId, userId },
        { $setOnInsert: { storeId, userId } },
        { upsert: true },
      );
    else await this.follows.deleteOne({ storeId, userId });
  }
}
