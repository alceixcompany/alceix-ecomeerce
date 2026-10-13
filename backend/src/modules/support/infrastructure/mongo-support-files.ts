import { Inject, Injectable, type OnModuleInit } from "@nestjs/common";
import { Schema, type Connection, type Model } from "mongoose";
import { DATABASE } from "../../../infrastructure/database";
import type {
  SupportFile,
  SupportFileRepository,
} from "../application/attachments.ports";
@Injectable()
export class MongoSupportFiles implements SupportFileRepository, OnModuleInit {
  private readonly model: Model<SupportFile>;
  constructor(@Inject(DATABASE) db: Connection) {
    const schema = new Schema<SupportFile>(
      {
        id: { type: String, unique: true, required: true },
        storeId: { type: String, required: true },
        uploadedBy: String,
        name: String,
        mime: String,
        size: Number,
        lifecycle: String,
        createdAt: Date,
      },
      { versionKey: false },
    );
    schema.index({ storeId: 1, id: 1 });
    schema.index({ lifecycle: 1, createdAt: 1, id: 1 });
    this.model = db.model("SupportFile", schema);
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
  async create(file: SupportFile) {
    await this.model.create(file);
  }
  find(storeId: string, id: string) {
    return this.model
      .findOne({ storeId, id, lifecycle: { $ne: "deleting" } })
      .select("-_id")
      .lean()
      .exec();
  }
}
