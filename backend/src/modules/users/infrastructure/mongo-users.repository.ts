import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { Schema, type Connection, type Model } from "mongoose";
import { DATABASE, MongoTransactions } from "../../../infrastructure/database";
import type { User } from "../domain/user";
import type { UsersRepository } from "../application/users.repository";
@Injectable()
export class MongoUsersRepository implements UsersRepository, OnModuleInit {
  private readonly model: Model<User>;
  constructor(
    @Inject(DATABASE) db: Connection,
    private readonly tx: MongoTransactions,
  ) {
    const schema = new Schema<User>(
      {
        id: { type: String, required: true, unique: true },
        name: String,
        email: { type: String, required: true, unique: true },
        passwordHash: { type: String, required: true },
        createdAt: Date,
      },
      { versionKey: false },
    );
    this.model = db.model<User>("User", schema);
  }
  async onModuleInit() {
    await this.model.init();
  }
  async create(user: User) {
    await this.model.create([user], { session: this.tx.session });
  }
  async findByEmail(email: string) {
    return this.model
      .findOne({ email })
      .select("-_id")
      .session(this.tx.session ?? null)
      .lean()
      .exec();
  }
  async findById(id: string) {
    return this.model
      .findOne({ id })
      .select("-_id")
      .session(this.tx.session ?? null)
      .lean()
      .exec();
  }
  async changePassword(id: string, passwordHash: string) {
    await this.model.updateOne(
      { id },
      { $set: { passwordHash } },
      { session: this.tx.session },
    );
  }
}
