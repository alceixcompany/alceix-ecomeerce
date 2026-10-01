import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { Schema, type Connection, type Model } from "mongoose";
import { DATABASE } from "../../../infrastructure/database";
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
  constructor(@Inject(DATABASE) db: Connection) {
    const cart = new Schema<Cart>(
      {
        hash: String,
        storeId: String,
        lines: [{ _id: false, productId: String, quantity: Number }],
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
    await this.carts.deleteOne({
      hash,
      storeId,
      expiresAt: { $lte: new Date() },
    });
    return (await this.carts
      .findOneAndUpdate(
        { hash, storeId },
        {
          $setOnInsert: { lines: [], version: 0 },
          $set: { expiresAt: new Date(Date.now() + 30 * 86400000) },
        },
        { upsert: true, returnDocument: "after" },
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
  ) {
    return this.carts
      .findOneAndUpdate(
        { hash, storeId, version, expiresAt: { $gt: new Date() } },
        { $set: { lines }, $inc: { version: 1 } },
        { returnDocument: "after" },
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
