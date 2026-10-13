import { Injectable, Inject, OnModuleInit } from "@nestjs/common";
import { Schema, type Connection, type Model } from "mongoose";
import { DATABASE } from "../../../infrastructure/database";
import type { Media, MediaRepository } from "../application/media.ports";
@Injectable()
export class MongoMediaRepository implements MediaRepository, OnModuleInit {
  private readonly model: Model<Media>;
  constructor(@Inject(DATABASE) db: Connection) {
    const schema = new Schema<Media>(
      {
        id: { type: String, unique: true },
        storeId: { type: String, index: true },
        kind: String,
        lifecycle: String,
        createdAt: Date,
        size: Number,
      },
      { versionKey: false },
    );
    schema.index({ lifecycle: 1, createdAt: 1, id: 1 });
    this.model = db.model<Media>("Media", schema);
  }
  async onModuleInit() {
    await this.model.init();
  }
  async retain(id: string) {
    const result = await this.model.updateOne(
      { id, lifecycle: { $ne: "deleting" } },
      { $set: { lifecycle: "retained" } },
    );
    return result.matchedCount === 1;
  }
  garbage(cutoff: Date) {
    return this.model
      .findOneAndUpdate(
        {
          $or: [
            { lifecycle: "unclaimed", createdAt: { $lte: cutoff } },
            { lifecycle: "deleting" },
          ],
        },
        { $set: { lifecycle: "deleting" } },
        { sort: { createdAt: 1, id: 1 }, returnDocument: "after" },
      )
      .select("-_id")
      .lean()
      .exec();
  }
  async removeRecord(id: string) {
    await this.model.deleteOne({ id, lifecycle: "deleting" });
  }
  async create(media: Media) {
    await this.model.create(media);
  }
  async byId(id: string) {
    return this.model
      .findOne({ id, lifecycle: { $ne: "deleting" } })
      .select("-_id")
      .lean()
      .exec();
  }
}
