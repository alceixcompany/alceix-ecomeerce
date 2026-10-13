import { Inject, Injectable, type OnModuleInit } from "@nestjs/common";
import { Schema, type Connection, type Model } from "mongoose";
import { DATABASE, MongoTransactions } from "../../../infrastructure/database";
import type { ReviewsRepository } from "../application/reviews.repository";
import type { Review } from "../domain/review";
import type { PageQuery } from "../../../shared/page";
@Injectable()
export class MongoReviewsRepository implements ReviewsRepository, OnModuleInit {
  private readonly model: Model<Review>;
  constructor(
    @Inject(DATABASE) db: Connection,
    private readonly tx: MongoTransactions,
  ) {
    const schema = new Schema<Review>(
      {
        id: { type: String, unique: true },
        sourceId: String,
        sourceKind: String,
        subjectId: String,
        subjectKind: String,
        authorId: String,
        displayName: String,
        initialInput: { type: { rating: Number, text: String }, _id: false },
        rating: Number,
        text: String,
        reply: String,
        status: String,
        moderationReason: String,
        version: Number,
        createdAt: Date,
      },
      { versionKey: false },
    );
    schema.index({ sourceId: 1, authorId: 1 }, { unique: true });
    schema.index({ subjectId: 1, status: 1, createdAt: -1, id: 1 });
    this.model = db.model<Review>("Review", schema);
  }
  async onModuleInit() {
    await this.model.init();
  }
  find(id: string) {
    return this.model
      .findOne({ id })
      .session(this.tx.session ?? null)
      .select("-_id")
      .lean()
      .exec();
  }
  bySource(sourceId: string, authorId: string) {
    return this.model
      .findOne({ sourceId, authorId })
      .session(this.tx.session ?? null)
      .select("-_id")
      .lean()
      .exec();
  }
  async create(review: Review) {
    await this.model.create([review], { session: this.tx.session });
  }
  save(review: Review, version: number) {
    const { id, version: _v, ...values } = review;
    return this.model
      .findOneAndUpdate(
        { id, version },
        { $set: values, $inc: { version: 1 } },
        { session: this.tx.session, returnDocument: "after" },
      )
      .select("-_id")
      .lean()
      .exec();
  }
  async list(
    subjectId: string | undefined,
    query: PageQuery,
    publicOnly: boolean,
  ) {
    const filter = {
      ...(subjectId ? { subjectId } : {}),
      ...(publicOnly ? { status: "approved" as const } : {}),
    };
    const total = await this.model.countDocuments(filter),
      pages = Math.max(1, Math.ceil(total / query.limit)),
      page = Math.min(pages, query.page);
    const stats = await this.model.aggregate<{ rating: number; count: number }>(
      [
        { $match: { ...(subjectId ? { subjectId } : {}), status: "approved" } },
        {
          $group: {
            _id: null,
            rating: { $avg: "$rating" },
            count: { $sum: 1 },
          },
        },
      ],
    );
    return {
      total,
      pages,
      page,
      rating: stats[0]?.rating ?? null,
      count: stats[0]?.count ?? 0,
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
