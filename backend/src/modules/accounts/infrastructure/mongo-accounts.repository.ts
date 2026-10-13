import { Inject, Injectable, type OnModuleInit } from "@nestjs/common";
import { Schema, type Connection, type Model } from "mongoose";
import { DATABASE, MongoTransactions } from "../../../infrastructure/database";
import type {
  AccountsRepository,
  Address,
  StoreCreation,
} from "../application/accounts.repository";
@Injectable()
export class MongoAccountsRepository
  implements AccountsRepository, OnModuleInit
{
  private readonly model: Model<Address>;
  private readonly creations: Model<StoreCreation>;
  constructor(
    @Inject(DATABASE) db: Connection,
    private readonly tx: MongoTransactions,
  ) {
    const schema = new Schema<Address>(
      {
        id: { type: String, unique: true },
        userId: String,
        title: String,
        customer: String,
        phone: String,
        city: String,
        address: String,
        isDefault: Boolean,
        version: Number,
        createdAt: Date,
      },
      { versionKey: false },
    );
    schema.index(
      { userId: 1, isDefault: 1 },
      { unique: true, partialFilterExpression: { isDefault: true } },
    );
    this.model = db.model<Address>("UserAddress", schema);
    this.creations = db.model<StoreCreation>(
      "StoreCreationRequest",
      new Schema<StoreCreation>(
        {
          id: { type: String, unique: true },
          userId: String,
          name: String,
          storeId: String,
        },
        { versionKey: false },
      ),
    );
  }
  async onModuleInit() {
    await Promise.all([this.model.init(), this.creations.init()]);
  }
  addresses(userId: string) {
    return this.model
      .find({ userId })
      .session(this.tx.session ?? null)
      .sort({ createdAt: -1, id: 1 })
      .limit(25)
      .select("-_id")
      .lean()
      .exec();
  }
  address(userId: string, id: string) {
    return this.model
      .findOne({ userId, id })
      .session(this.tx.session ?? null)
      .select("-_id")
      .lean()
      .exec();
  }
  async createAddress(address: Address) {
    await this.model.create([address], { session: this.tx.session });
  }
  saveAddress(address: Address, version: number) {
    const { id, userId, version: _v, ...values } = address;
    return this.model
      .findOneAndUpdate(
        { id, userId, version },
        { $set: values, $inc: { version: 1 } },
        { session: this.tx.session, returnDocument: "after" },
      )
      .select("-_id")
      .lean()
      .exec();
  }
  async clearDefault(userId: string) {
    await this.model.updateMany(
      { userId, isDefault: true },
      { $set: { isDefault: false }, $inc: { version: 1 } },
      { session: this.tx.session },
    );
  }
  async deleteAddress(userId: string, id: string, version: number) {
    return (
      (
        await this.model.deleteOne(
          { userId, id, version },
          { session: this.tx.session },
        )
      ).deletedCount === 1
    );
  }
  creation(id: string) {
    return this.creations
      .findOne({ id })
      .session(this.tx.session ?? null)
      .select("-_id")
      .lean()
      .exec();
  }
  async createStoreRequest(creation: StoreCreation) {
    await this.creations.create([creation], { session: this.tx.session });
  }
}
