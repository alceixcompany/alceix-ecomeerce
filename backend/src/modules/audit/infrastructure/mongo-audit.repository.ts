import { Inject, Injectable, type OnModuleInit } from "@nestjs/common";
import { Schema, type Connection, type Model } from "mongoose";
import { DATABASE, MongoTransactions } from "../../../infrastructure/database";
import type {
  AuditRepository,
  AuditEntry,
} from "../application/audit.repository";
import type { PageQuery } from "../../../shared/page";
@Injectable()
export class MongoAuditRepository implements AuditRepository, OnModuleInit {
  private readonly model: Model<AuditEntry>;
  constructor(
    @Inject(DATABASE) db: Connection,
    private readonly tx: MongoTransactions,
  ) {
    const schema = new Schema<AuditEntry>(
      {
        id: { type: String, unique: true },
        actorId: String,
        scopeId: String,
        action: String,
        subjectId: String,
        createdAt: Date,
      },
      { versionKey: false },
    );
    schema.index({ scopeId: 1, createdAt: -1, id: 1 });
    this.model = db.model<AuditEntry>("AuditEntry", schema);
  }
  async onModuleInit() {
    await this.model.init();
  }
  async append(entry: AuditEntry) {
    await this.model.create([entry], { session: this.tx.session });
  }
  async list(scopeId: string | undefined, query: PageQuery) {
    const filter = scopeId ? { scopeId } : {};
    const total = await this.model.countDocuments(filter),
      pages = Math.max(1, Math.ceil(total / query.limit)),
      page = Math.min(pages, query.page);
    return {
      total,
      pages,
      page,
      items: await this.model
        .find(filter)
        .sort({ createdAt: -1, id: 1 })
        .skip((page - 1) * query.limit)
        .limit(query.limit)
        .select("-_id")
        .lean()
        .exec(),
    };
  }
}
