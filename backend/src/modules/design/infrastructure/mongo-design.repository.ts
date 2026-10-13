import { Inject, Injectable, type OnModuleInit } from "@nestjs/common";
import { Schema, type Connection, type Model } from "mongoose";
import { DATABASE } from "../../../infrastructure/database";
import type { DesignRecord, StoreDesign } from "../domain/design";
import type { DesignRepository } from "../application/design.repository";
@Injectable()
export class MongoDesignRepository implements DesignRepository, OnModuleInit {
  private readonly model: Model<DesignRecord>;
  constructor(@Inject(DATABASE) db: Connection) {
    this.model = db.model<DesignRecord>(
      "StoreDesign",
      new Schema<DesignRecord>(
        {
          storeId: { type: String, unique: true, required: true },
          version: Number,
          draft: Schema.Types.Mixed,
          published: Schema.Types.Mixed,
          updatedAt: Date,
          publishedAt: Date,
        },
        { versionKey: false },
      ),
    );
  }
  async onModuleInit() {
    await this.model.init();
  }
  get(storeId: string) {
    return this.model.findOne({ storeId }).select("-_id").lean().exec();
  }
  save(
    storeId: string,
    version: number,
    design: StoreDesign,
    publish: boolean,
  ) {
    const now = new Date();
    return this.model
      .findOneAndUpdate(
        { storeId, version },
        {
          $set: {
            draft: design,
            updatedAt: now,
            ...(publish ? { published: design, publishedAt: now } : {}),
          },
          $inc: { version: 1 },
        },
        { returnDocument: "after", upsert: version === 0 },
      )
      .select("-_id")
      .lean()
      .exec();
  }
}
