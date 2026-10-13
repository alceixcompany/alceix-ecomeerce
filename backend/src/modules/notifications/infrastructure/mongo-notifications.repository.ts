import { Inject, Injectable, type OnModuleInit } from "@nestjs/common";
import { Schema, type Connection, type Model } from "mongoose";
import { DATABASE, MongoTransactions } from "../../../infrastructure/database";
import type {
  NotificationsRepository,
  InboxNotification,
  DeliveryBatch,
  Delivery,
  Subscription,
  OptOutToken,
} from "../application/notifications.repository";
@Injectable()
export class MongoNotificationsRepository
  implements NotificationsRepository, OnModuleInit
{
  private readonly inboxModel: Model<InboxNotification>;
  private readonly subscriptions: Model<Subscription>;
  private readonly tokens: Model<OptOutToken>;
  private readonly batches: Model<DeliveryBatch>;
  private readonly deliveries: Model<Delivery>;
  constructor(
    @Inject(DATABASE) db: Connection,
    private readonly tx: MongoTransactions,
  ) {
    const inbox = new Schema<InboxNotification>(
      {
        id: { type: String, unique: true },
        userId: String,
        sourceId: String,
        title: String,
        text: String,
        url: String,
        read: Boolean,
        createdAt: Date,
      },
      { versionKey: false },
    );
    inbox.index({ userId: 1, sourceId: 1 }, { unique: true });
    inbox.index({ userId: 1, createdAt: -1, id: 1 });
    this.inboxModel = db.model<InboxNotification>("InboxNotification", inbox);
    const sub = new Schema<Subscription>(
      { storeId: String, customerId: String, active: Boolean },
      { versionKey: false },
    );
    sub.index({ storeId: 1, customerId: 1 }, { unique: true });
    this.subscriptions = db.model<Subscription>(
      "CommunicationSubscription",
      sub,
    );
    this.tokens = db.model<OptOutToken>(
      "OptOutToken",
      new Schema<OptOutToken>(
        {
          hash: { type: String, unique: true },
          storeId: String,
          customerId: String,
        },
        { versionKey: false },
      ),
    );
    this.batches = db.model<DeliveryBatch>(
      "DeliveryBatch",
      new Schema<DeliveryBatch>(
        {
          id: { type: String, unique: true },
          storeId: String,
          draftId: String,
          dispatchLock: Number,
          source: String,
          recipients: [String],
          draftVersion: Number,
          actorId: String,
          subject: String,
          message: String,
          channel: String,
          segment: String,
          cursor: String,
          status: String,
          version: Number,
          createdAt: Date,
        },
        { versionKey: false },
      ),
    );
    const delivery = new Schema<Delivery>(
      {
        id: { type: String, unique: true },
        batchId: String,
        audience: String,
        storeId: String,
        customerId: String,
        status: String,
        availableAt: Date,
        createdAt: Date,
      },
      { versionKey: false },
    );
    delivery.index({ batchId: 1, customerId: 1 }, { unique: true });
    delivery.index({ status: 1, availableAt: 1, createdAt: 1 });
    this.deliveries = db.model<Delivery>("NotificationDelivery", delivery);
  }
  async onModuleInit() {
    await Promise.all([
      this.inboxModel.init(),
      this.subscriptions.init(),
      this.tokens.init(),
      this.batches.init(),
      this.deliveries.init(),
    ]);
  }
  async inbox(userId: string, requestedPage: number, limit: number) {
    const total = await this.inboxModel.countDocuments({ userId }),
      pages = Math.max(1, Math.ceil(total / limit)),
      page = Math.min(pages, requestedPage);
    return {
      total,
      pages,
      page,
      items: await this.inboxModel
        .find({ userId })
        .sort({ createdAt: -1, id: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select("-_id -userId")
        .lean()
        .exec(),
    };
  }
  async notify(notification: InboxNotification) {
    await this.inboxModel.updateOne(
      { userId: notification.userId, sourceId: notification.sourceId },
      { $setOnInsert: notification },
      { upsert: true, session: this.tx.session },
    );
  }
  async read(userId: string, id: string) {
    return (
      (
        await this.inboxModel.updateOne(
          { userId, id },
          { $set: { read: true } },
        )
      ).matchedCount === 1
    );
  }
  subscription(storeId: string, customerId: string) {
    return this.subscriptions
      .findOne({ storeId, customerId })
      .session(this.tx.session ?? null)
      .select("-_id")
      .lean()
      .exec();
  }
  async saveSubscription(subscription: Subscription) {
    await this.subscriptions.updateOne(
      { storeId: subscription.storeId, customerId: subscription.customerId },
      { $set: subscription },
      { upsert: true, session: this.tx.session },
    );
  }
  token(hash: string) {
    return this.tokens.findOne({ hash }).select("-_id").lean().exec();
  }
  async createToken(token: OptOutToken) {
    await this.tokens.create([token], { session: this.tx.session });
  }
  batch(id: string) {
    return this.batches
      .findOne({ id })
      .session(this.tx.session ?? null)
      .select("-_id")
      .lean()
      .exec();
  }
  async createBatch(batch: DeliveryBatch) {
    await this.batches.create([batch], { session: this.tx.session });
  }
  nextBatch() {
    return this.batches
      .findOne({ status: { $in: ["queued", "producing"] } })
      .sort({ createdAt: 1, id: 1 })
      .select("-_id")
      .lean()
      .exec();
  }
  async saveBatch(batch: DeliveryBatch, version: number) {
    const { id, version: _v, ...values } = batch;
    return (
      (
        await this.batches.updateOne(
          { id, version },
          { $set: values, $inc: { version: 1 } },
          { session: this.tx.session },
        )
      ).modifiedCount === 1
    );
  }
  delivery(id: string) {
    return this.deliveries
      .findOne({ id })
      .session(this.tx.session ?? null)
      .select("-_id")
      .lean()
      .exec();
  }
  async createDelivery(delivery: Delivery) {
    await this.deliveries.create([delivery], { session: this.tx.session });
  }
  nextDelivery() {
    return this.deliveries
      .findOne({ status: "queued", availableAt: { $lte: new Date() } })
      .sort({ availableAt: 1, id: 1 })
      .select("-_id")
      .lean()
      .exec();
  }
  async saveDelivery(
    id: string,
    status: Delivery["status"],
    availableAt?: Date,
  ) {
    await this.deliveries.updateOne(
      { id },
      { $set: { status, ...(availableAt ? { availableAt } : {}) } },
      { session: this.tx.session },
    );
  }
  async stats(batchId: string) {
    const groups = await this.deliveries.aggregate<{
      _id: string;
      count: number;
    }>([
      { $match: { batchId } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    return Object.fromEntries(groups.map((group) => [group._id, group.count]));
  }
  async lockBatch(id: string) {
    const result = await this.batches.updateOne(
      { id, status: { $ne: "cancelled" } },
      { $inc: { dispatchLock: 1 } },
      { session: this.tx.session },
    );
    return result.matchedCount === 1;
  }
}
