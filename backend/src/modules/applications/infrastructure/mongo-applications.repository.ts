import { Injectable, Inject, OnModuleInit } from "@nestjs/common";
import { Schema, type Connection, type Model } from "mongoose";
import { DATABASE } from "../../../infrastructure/database";
import type {
  ApplicationsRepository,
  Application,
} from "../application/applications.repository";
@Injectable()
export class MongoApplicationsRepository
  implements ApplicationsRepository, OnModuleInit
{
  private readonly model: Model<Application>;
  constructor(@Inject(DATABASE) db: Connection) {
    const schema = new Schema<Application>(
      {
        id: { type: String, unique: true },
        type: String,
        status: String,
        payload: { type: Map, of: String },
        createdAt: Date,
      },
      { versionKey: false },
    );
    schema.index({ type: 1, status: 1, createdAt: -1 });
    this.model = db.model<Application>("Application", schema);
  }
  async onModuleInit() {
    await this.model.init();
  }
  async create(application: Application) {
    await this.model.create(application);
  }
}
