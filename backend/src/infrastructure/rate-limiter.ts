import { Inject, Injectable, type OnModuleInit } from "@nestjs/common";
import { createHash } from "node:crypto";
import { Schema, type Connection, type Model } from "mongoose";
import { DATABASE } from "./database-token";
type Bucket = { id: string; count: number; expiresAt: Date };
@Injectable()
export class RateLimiter implements OnModuleInit {
  private readonly model: Model<Bucket>;
  constructor(@Inject(DATABASE) db: Connection) {
    this.model = db.model<Bucket>(
      "RateBucket",
      new Schema<Bucket>(
        {
          id: { type: String, unique: true },
          count: Number,
          expiresAt: { type: Date, expires: 0 },
        },
        { versionKey: false },
      ),
    );
  }
  async onModuleInit() {
    await this.model.init();
  }
  async consume(ip: string, category: string, limit: number, now = Date.now()) {
    const window = Math.floor(now / 60000),
      id = createHash("sha256")
        .update(`${ip}:${category}:${window}`)
        .digest("hex"),
      expiresAt = new Date((window + 2) * 60000);
    let bucket: Bucket | null;
    try {
      bucket = await this.model
        .findOneAndUpdate(
          { id },
          { $inc: { count: 1 }, $setOnInsert: { expiresAt } },
          { upsert: true, returnDocument: "after" },
        )
        .lean()
        .exec();
    } catch (error) {
      if (
        !error ||
        typeof error !== "object" ||
        !("code" in error) ||
        error.code !== 11000
      )
        throw error;
      bucket = await this.model
        .findOneAndUpdate(
          { id },
          { $inc: { count: 1 } },
          { returnDocument: "after" },
        )
        .lean()
        .exec();
    }
    return {
      allowed: !!bucket && bucket.count <= limit,
      retryAfter: Math.max(1, Math.ceil(((window + 1) * 60000 - now) / 1000)),
    };
  }
}
