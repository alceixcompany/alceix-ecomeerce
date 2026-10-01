import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { Schema, type Model, type Connection } from "mongoose";
import { DATABASE, MongoTransactions } from "../../../infrastructure/database";
import type {
  AuthRepository,
  Session,
  Reset,
} from "../application/auth.repository";
@Injectable()
export class MongoAuthRepository implements AuthRepository, OnModuleInit {
  private readonly sessions: Model<Session>;
  private readonly resets: Model<Reset>;
  constructor(
    @Inject(DATABASE) db: Connection,
    private readonly tx: MongoTransactions,
  ) {
    const session = new Schema<Session>(
      {
        hash: { type: String, unique: true },
        userId: { type: String, index: true },
        expiresAt: { type: Date, expires: 0 },
      },
      { versionKey: false },
    );
    const reset = new Schema<Reset>(
      {
        hash: { type: String, unique: true },
        userId: { type: String, unique: true },
        expiresAt: { type: Date, expires: 0 },
      },
      { versionKey: false },
    );
    this.sessions = db.model<Session>("Session", session);
    this.resets = db.model<Reset>("PasswordReset", reset);
  }
  async onModuleInit() {
    await this.sessions.init();
    await this.resets.init();
  }
  async createSession(session: Session) {
    await this.sessions.create([session], { session: this.tx.session });
  }
  async findSession(hash: string) {
    return this.sessions
      .findOne({ hash, expiresAt: { $gt: new Date() } })
      .select("-_id")
      .lean()
      .exec();
  }
  async deleteSession(hash: string) {
    await this.sessions.deleteOne({ hash });
  }
  async deleteUserSessions(userId: string) {
    await this.sessions.deleteMany({ userId }, { session: this.tx.session });
  }
  async saveReset(reset: Reset) {
    await this.resets.updateOne(
      { userId: reset.userId },
      { $set: reset },
      { upsert: true },
    );
  }
  async consumeReset(hash: string) {
    return this.resets
      .findOneAndDelete(
        { hash, expiresAt: { $gt: new Date() } },
        { session: this.tx.session },
      )
      .select("-_id")
      .lean()
      .exec();
  }
}
