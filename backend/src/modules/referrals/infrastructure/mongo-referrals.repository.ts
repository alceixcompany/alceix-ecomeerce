import { Inject, Injectable, type OnModuleInit } from "@nestjs/common";
import { Schema, type Connection, type Model } from "mongoose";
import { DATABASE, MongoTransactions } from "../../../infrastructure/database";
import type { ReferralsRepository } from "../application/referrals.repository";
import type {
  ReferralCode,
  ReferralCodeInput,
  ReferralConversion,
} from "../domain/referral";
import { literalSearch, type PageQuery } from "../../../shared/page";
@Injectable()
export class MongoReferralsRepository
  implements ReferralsRepository, OnModuleInit
{
  private readonly codesModel: Model<ReferralCode>;
  private readonly conversionsModel: Model<ReferralConversion>;
  constructor(
    @Inject(DATABASE) db: Connection,
    private readonly tx: MongoTransactions,
  ) {
    const fields = {
      ownerId: String,
      code: String,
      title: String,
      kind: String,
      rewardBps: Number,
      discountBps: Number,
      discountStoreId: String,
      discountUses: Number,
      startsOn: String,
      endsOn: String,
      active: Boolean,
      qualification: String,
    };
    const code = new Schema<ReferralCode>(
      {
        ...fields,
        id: { type: String, unique: true },
        initialInput: new Schema<ReferralCodeInput>(fields, { _id: false }),
        couponId: String,
        version: Number,
        createdAt: Date,
      },
      { versionKey: false },
    );
    code.index({ code: 1 }, { unique: true });
    code.index({ ownerId: 1, createdAt: -1, id: 1 });
    this.codesModel = db.model<ReferralCode>("ReferralCode", code);
    const conversion = new Schema<ReferralConversion>(
      {
        id: { type: String, unique: true },
        codeId: String,
        ownerId: String,
        customerId: { type: String, unique: true },
        rewardBps: Number,
        qualification: String,
        status: String,
        sourceId: String,
        commissionBaseCents: Number,
        rewardCents: Number,
        version: Number,
        createdAt: Date,
      },
      { versionKey: false },
    );
    conversion.index({ ownerId: 1, createdAt: -1, id: 1 });
    conversion.index({ sourceId: 1 });
    this.conversionsModel = db.model<ReferralConversion>(
      "ReferralConversion",
      conversion,
    );
  }
  async onModuleInit() {
    await this.codesModel.init();
    await this.conversionsModel.init();
  }
  code(id: string) {
    return this.codesModel
      .findOne({ id })
      .session(this.tx.session ?? null)
      .select("-_id")
      .lean()
      .exec();
  }
  byCode(code: string) {
    return this.codesModel
      .findOne({ code })
      .session(this.tx.session ?? null)
      .select("-_id")
      .lean()
      .exec();
  }
  async createCode(code: ReferralCode) {
    await this.codesModel.create([code], { session: this.tx.session });
  }
  saveCode(code: ReferralCode, version: number) {
    const { id, version: _v, ...values } = code;
    return this.codesModel
      .findOneAndUpdate(
        { id, version },
        { $set: values, $inc: { version: 1 } },
        { session: this.tx.session, returnDocument: "after" },
      )
      .select("-_id")
      .lean()
      .exec();
  }
  conversionByCustomer(customerId: string) {
    return this.conversionsModel
      .findOne({ customerId })
      .session(this.tx.session ?? null)
      .select("-_id")
      .lean()
      .exec();
  }
  conversionBySource(sourceId: string) {
    return this.conversionsModel
      .findOne({ sourceId })
      .session(this.tx.session ?? null)
      .select("-_id")
      .lean()
      .exec();
  }
  async createConversion(conversion: ReferralConversion) {
    await this.conversionsModel.create([conversion], {
      session: this.tx.session,
    });
  }
  saveConversion(conversion: ReferralConversion, version: number) {
    const { id, version: _v, ...values } = conversion;
    return this.conversionsModel
      .findOneAndUpdate(
        { id, version },
        { $set: values, $inc: { version: 1 } },
        { session: this.tx.session, returnDocument: "after" },
      )
      .select("-_id")
      .lean()
      .exec();
  }
  async codes(query: PageQuery, ownerId?: string) {
    const filter = {
      ...(ownerId ? { ownerId } : {}),
      ...(query.q
        ? { code: { $regex: literalSearch(query.q), $options: "i" } }
        : {}),
    };
    const total = await this.codesModel.countDocuments(filter),
      pages = Math.max(1, Math.ceil(total / query.limit)),
      page = Math.min(query.page, pages);
    return {
      total,
      pages,
      page,
      items: await this.codesModel
        .find(filter)
        .sort({ createdAt: -1, id: 1 })
        .skip((page - 1) * query.limit)
        .limit(query.limit)
        .select("-_id -initialInput")
        .lean()
        .exec(),
    };
  }
  async conversions(query: PageQuery, ownerId?: string) {
    const filter = ownerId ? { ownerId } : {};
    const total = await this.conversionsModel.countDocuments(filter),
      pages = Math.max(1, Math.ceil(total / query.limit)),
      page = Math.min(query.page, pages);
    return {
      total,
      pages,
      page,
      items: await this.conversionsModel
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
