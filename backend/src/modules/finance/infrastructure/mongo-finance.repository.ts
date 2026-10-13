import { Inject, Injectable, type OnModuleInit } from "@nestjs/common";
import { Schema, Types, type Connection, type Model } from "mongoose";
import { DATABASE, MongoTransactions } from "../../../infrastructure/database";
import type { FinanceRepository } from "../application/finance.repository";
import type {
  CommercePolicy,
  Journal,
  BankProfile,
  Withdrawal,
  BankVerificationReceipt,
} from "../domain/finance";
import type { PageQuery } from "../../../shared/page";
type Balance = {
  account: string;
  balanceCents: Types.Decimal128;
  version: number;
};
@Injectable()
export class MongoFinanceRepository implements FinanceRepository, OnModuleInit {
  private readonly bankReceipts: Model<BankVerificationReceipt>;
  private readonly policies: Model<CommercePolicy>;
  private readonly ledger: Model<Journal>;
  private readonly balances: Model<Balance>;
  private readonly banks: Model<BankProfile>;
  private readonly withdrawalModel: Model<Withdrawal>;
  constructor(
    @Inject(DATABASE) db: Connection,
    private readonly tx: MongoTransactions,
  ) {
    this.bankReceipts = db.model<BankVerificationReceipt>(
      "BankVerificationReceipt",
      new Schema<BankVerificationReceipt>(
        {
          id: { type: String, unique: true },
          fingerprint: String,
          profile: Schema.Types.Mixed,
        },
        { versionKey: false },
      ),
    );
    this.policies = db.model<CommercePolicy>(
      "CommercePolicy",
      new Schema<CommercePolicy>(
        {
          scopeId: { type: String, unique: true },
          commissionBasisPoints: Number,
          returnDays: Number,
          shippingMode: String,
          fixedShippingCents: Number,
          version: Number,
        },
        { versionKey: false },
      ),
    );
    const journal = new Schema<Journal>(
      {
        id: { type: String, unique: true },
        scopeId: String,
        kind: String,
        referenceId: String,
        postings: [
          new Schema({ account: String, deltaCents: Number }, { _id: false }),
        ],
        createdAt: Date,
      },
      { versionKey: false },
    );
    journal.index({ referenceId: 1, kind: 1 }, { unique: true });
    journal.index({ scopeId: 1, createdAt: -1, id: 1 });
    journal.index({ "postings.account": 1, createdAt: -1, id: 1 });
    this.ledger = db.model<Journal>("FinanceJournal", journal);
    this.balances = db.model<Balance>(
      "FinanceBalance",
      new Schema<Balance>(
        {
          account: { type: String, unique: true },
          balanceCents: Schema.Types.Decimal128,
          version: { type: Number, default: 0 },
        },
        { versionKey: false },
      ),
    );
    this.banks = db.model<BankProfile>(
      "VerifiedBank",
      new Schema<BankProfile>(
        {
          scopeId: { type: String, unique: true },
          owner: String,
          maskedIban: String,
          bankReference: String,
          version: Number,
          verifiedAt: Date,
        },
        { versionKey: false },
      ),
    );
    const withdrawalSchema = new Schema<Withdrawal>(
      {
        id: { type: String, unique: true },
        scopeId: String,
        actorId: String,
        amountCents: Number,
        bankReference: String,
        status: String,
        version: Number,
        createdAt: Date,
        reviewedBy: String,
        reviewedAt: Date,
        reviewReason: String,
      },
      { versionKey: false },
    );
    withdrawalSchema.index({ scopeId: 1, createdAt: -1, id: 1 });
    withdrawalSchema.index({ status: 1, createdAt: -1, id: 1 });
    this.withdrawalModel = db.model<Withdrawal>("Withdrawal", withdrawalSchema);
  }
  async onModuleInit() {
    await Promise.all([
      this.bankReceipts.init(),
      this.policies.init(),
      this.ledger.init(),
      this.balances.init(),
      this.banks.init(),
      this.withdrawalModel.init(),
    ]);
  }
  bankReceipt(id: string) {
    return this.bankReceipts
      .findOne({ id })
      .session(this.tx.session ?? null)
      .select("-_id")
      .lean()
      .exec();
  }
  async createBankReceipt(receipt: BankVerificationReceipt) {
    await this.bankReceipts.create([receipt], { session: this.tx.session });
  }
  policy(scopeId: string) {
    return this.policies
      .findOne({ scopeId })
      .session(this.tx.session ?? null)
      .select("-_id")
      .lean()
      .exec();
  }
  savePolicy(policy: CommercePolicy, version: number) {
    const { scopeId, version: _v, ...values } = policy;
    return this.policies
      .findOneAndUpdate(
        { scopeId, version },
        { $set: values, $inc: { version: 1 } },
        {
          upsert: version === 0,
          returnDocument: "after",
          session: this.tx.session,
        },
      )
      .select("-_id")
      .lean()
      .exec();
  }
  journal(referenceId: string, kind: string) {
    return this.ledger
      .findOne({ referenceId, kind })
      .session(this.tx.session ?? null)
      .select("-_id")
      .lean()
      .exec();
  }
  async post(journal: Journal) {
    await this.ledger.create([journal], { session: this.tx.session });
    for (const posting of journal.postings)
      await this.balances.updateOne(
        { account: posting.account },
        {
          $inc: {
            balanceCents: Types.Decimal128.fromString(
              String(posting.deltaCents),
            ),
          },
        },
        { upsert: true, session: this.tx.session },
      );
  }
  async balance(account: string) {
    const balance = (
      await this.balances
        .findOne({ account })
        .session(this.tx.session ?? null)
        .lean()
        .exec()
    )?.balanceCents;
    const cents = BigInt(balance?.toString() ?? "0");
    if (
      cents > BigInt(Number.MAX_SAFE_INTEGER) ||
      cents < BigInt(Number.MIN_SAFE_INTEGER)
    )
      throw new Error("Balance exceeds API integer range");
    return Number(cents);
  }
  async debit(account: string, amount: number) {
    const result = await this.balances.updateOne(
      {
        account,
        balanceCents: { $gte: Types.Decimal128.fromString(String(amount)) },
      },
      { $inc: { version: 1 } },
      { session: this.tx.session },
    );
    return result.modifiedCount === 1;
  }
  async journals(scopeId: string | undefined, query: PageQuery) {
    const filter = {
      ...(scopeId
        ? {
            $or: [
              { scopeId },
              {
                "postings.account": {
                  $in: [`available:${scopeId}`, `pending:${scopeId}`],
                },
              },
            ],
          }
        : {}),
      ...(query.q
        ? {
            $and: [
              {
                $or: [
                  {
                    kind: {
                      $regex: query.q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
                      $options: "i",
                    },
                  },
                  {
                    referenceId: {
                      $regex: query.q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
                      $options: "i",
                    },
                  },
                ],
              },
            ],
          }
        : {}),
    };
    const total = await this.ledger.countDocuments(filter),
      pages = Math.max(1, Math.ceil(total / query.limit)),
      page = Math.min(pages, query.page);
    return {
      total,
      pages,
      page,
      items: await this.ledger
        .find(filter)
        .sort({ createdAt: -1, id: 1 })
        .skip((page - 1) * query.limit)
        .limit(query.limit)
        .select("-_id")
        .lean()
        .exec(),
    };
  }
  bank(scopeId: string) {
    return this.banks
      .findOne({ scopeId })
      .session(this.tx.session ?? null)
      .select("-_id")
      .lean()
      .exec();
  }
  saveBank(bank: BankProfile, version: number) {
    const { scopeId, version: _v, ...values } = bank;
    return this.banks
      .findOneAndUpdate(
        { scopeId, version },
        { $set: values, $inc: { version: 1 } },
        {
          upsert: version === 0,
          session: this.tx.session,
          returnDocument: "after",
        },
      )
      .select("-_id")
      .lean()
      .exec();
  }
  async withdrawals(
    scopeId: string | undefined,
    query: PageQuery,
    status?: Withdrawal["status"],
  ) {
    const filter = {
      ...(scopeId ? { scopeId } : {}),
      ...(status ? { status } : {}),
      ...(query.q
        ? {
            id: {
              $regex: query.q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
              $options: "i",
            },
          }
        : {}),
    };
    const total = await this.withdrawalModel.countDocuments(filter),
      pages = Math.max(1, Math.ceil(total / query.limit)),
      page = Math.min(query.page, pages);
    return {
      total,
      pages,
      page,
      items: await this.withdrawalModel
        .find(filter)
        .sort({ createdAt: -1, id: 1 })
        .skip((page - 1) * query.limit)
        .limit(query.limit)
        .select("-_id")
        .lean()
        .exec(),
    };
  }
  withdrawal(id: string) {
    return this.withdrawalModel
      .findOne({ id })
      .session(this.tx.session ?? null)
      .select("-_id")
      .lean()
      .exec();
  }
  async createWithdrawal(withdrawal: Withdrawal) {
    await this.withdrawalModel.create([withdrawal], {
      session: this.tx.session,
    });
  }
  saveWithdrawal(withdrawal: Withdrawal, version: number) {
    const { id, version: _v, ...values } = withdrawal;
    return this.withdrawalModel
      .findOneAndUpdate(
        { id, version },
        { $set: values, $inc: { version: 1 } },
        { session: this.tx.session, returnDocument: "after" },
      )
      .select("-_id")
      .lean()
      .exec();
  }
}
