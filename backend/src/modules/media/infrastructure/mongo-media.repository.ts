import { Injectable, Inject, OnModuleInit } from "@nestjs/common";
import { Schema, type Connection, type Model } from "mongoose";
import { DATABASE } from "../../../infrastructure/database";
import type { Media, MediaRepository } from "../application/media.ports";
@Injectable()
export class MongoMediaRepository implements MediaRepository, OnModuleInit {
  private readonly model: Model<Media>;
  constructor(@Inject(DATABASE) db: Connection) {
    this.model = db.model<Media>(
      "Media",
      new Schema<Media>(
        {
          id: { type: String, unique: true },
          storeId: { type: String, index: true },
          kind: String,
          createdAt: Date,
          size: Number,
        },
        { versionKey: false },
      ),
    );
  }
  async onModuleInit() {
    await this.model.init();
  }
  async create(media: Media) {
    await this.model.create(media);
  }
  async byId(id: string) {
    return this.model.findOne({ id }).select("-_id").lean().exec();
  }
}
