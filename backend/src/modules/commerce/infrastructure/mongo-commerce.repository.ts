import { Inject, Injectable, type OnModuleInit } from "@nestjs/common";
import { Schema, type Connection, type Model } from "mongoose";
import { DATABASE, MongoTransactions } from "../../../infrastructure/database";
import type { CommerceRepository } from "../application/commerce.repository";
import type {
  PaymentIntent,
  Shipment,
  RefundRequest,
  CheckoutReceipt,
} from "../domain/commerce";
@Injectable()
export class MongoCommerceRepository
  implements CommerceRepository, OnModuleInit
{
  private readonly checkouts: Model<CheckoutReceipt>;
  private readonly payments: Model<PaymentIntent>;
  private readonly shipments: Model<Shipment>;
  private readonly refunds: Model<RefundRequest>;
  constructor(
    @Inject(DATABASE) db: Connection,
    private readonly tx: MongoTransactions,
  ) {
    this.checkouts = db.model<CheckoutReceipt>(
      "CheckoutReceipt",
      new Schema<CheckoutReceipt>(
        {
          id: { type: String, unique: true },
          storeId: String,
          buyerId: String,
          orderId: String,
          input: String,
          createdAt: Date,
        },
        { versionKey: false },
      ),
    );
    this.payments = db.model<PaymentIntent>(
      "PaymentIntent",
      new Schema<PaymentIntent>(
        {
          id: { type: String, unique: true },
          storeId: String,
          orderId: { type: String, unique: true },
          actorId: String,
          amountCents: Number,
          couponCode: String,
          providerReference: String,
          commissionBasisPoints: Number,
          status: String,
          version: Number,
          createdAt: Date,
        },
        { versionKey: false },
      ),
    );
    this.shipments = db.model<Shipment>(
      "Shipment",
      new Schema<Shipment>(
        {
          id: { type: String, unique: true },
          storeId: String,
          orderId: { type: String, unique: true },
          status: String,
          carrier: String,
          tracking: String,
          labelUrl: String,
          version: Number,
          createdAt: Date,
        },
        { versionKey: false },
      ),
    );
    this.refunds = db.model<RefundRequest>(
      "RefundRequest",
      new Schema<RefundRequest>(
        {
          id: { type: String, unique: true },
          storeId: String,
          orderId: { type: String, unique: true },
          buyerId: String,
          paymentId: String,
          reason: String,
          status: String,
          restock: Boolean,
          settled: Boolean,
          late: Boolean,
          version: Number,
          createdAt: Date,
        },
        { versionKey: false },
      ),
    );
  }
  async onModuleInit() {
    await Promise.all([
      this.checkouts.init(),
      this.payments.init(),
      this.shipments.init(),
      this.refunds.init(),
    ]);
  }
  checkout(id: string) {
    return this.checkouts
      .findOne({ id })
      .session(this.tx.session ?? null)
      .select("-_id")
      .lean()
      .exec();
  }
  async createCheckout(receipt: CheckoutReceipt) {
    await this.checkouts.create([receipt], { session: this.tx.session });
  }
  payment(id: string) {
    return this.payments
      .findOne({ id })
      .session(this.tx.session ?? null)
      .select("-_id")
      .lean()
      .exec();
  }
  orderPayment(orderId: string) {
    return this.payments
      .findOne({ orderId })
      .session(this.tx.session ?? null)
      .select("-_id")
      .lean()
      .exec();
  }
  async createPayment(payment: PaymentIntent) {
    await this.payments.create([payment], { session: this.tx.session });
  }
  savePayment(payment: PaymentIntent, version: number) {
    const { id, version: _v, ...values } = payment;
    return this.payments
      .findOneAndUpdate(
        { id, version },
        { $set: values, $inc: { version: 1 } },
        { returnDocument: "after", session: this.tx.session },
      )
      .select("-_id")
      .lean()
      .exec();
  }
  shipment(id: string) {
    return this.shipments
      .findOne({ id })
      .session(this.tx.session ?? null)
      .select("-_id")
      .lean()
      .exec();
  }
  orderShipment(orderId: string) {
    return this.shipments
      .findOne({ orderId })
      .session(this.tx.session ?? null)
      .select("-_id")
      .lean()
      .exec();
  }
  async createShipment(shipment: Shipment) {
    await this.shipments.create([shipment], { session: this.tx.session });
  }
  saveShipment(shipment: Shipment, version: number) {
    const { id, version: _v, ...values } = shipment;
    return this.shipments
      .findOneAndUpdate(
        { id, version },
        { $set: values, $inc: { version: 1 } },
        { returnDocument: "after", session: this.tx.session },
      )
      .select("-_id")
      .lean()
      .exec();
  }
  compensations() {
    return this.refunds
      .find({ late: true, status: "received" })
      .sort({ createdAt: 1, id: 1 })
      .limit(100)
      .select("-_id")
      .lean()
      .exec();
  }
  refund(id: string) {
    return this.refunds
      .findOne({ id })
      .session(this.tx.session ?? null)
      .select("-_id")
      .lean()
      .exec();
  }
  orderRefund(orderId: string) {
    return this.refunds
      .findOne({ orderId })
      .session(this.tx.session ?? null)
      .select("-_id")
      .lean()
      .exec();
  }
  async createRefund(refund: RefundRequest) {
    await this.refunds.create([refund], { session: this.tx.session });
  }
  saveRefund(refund: RefundRequest, version: number) {
    const { id, version: _v, ...values } = refund;
    return this.refunds
      .findOneAndUpdate(
        { id, version },
        { $set: values, $inc: { version: 1 } },
        { returnDocument: "after", session: this.tx.session },
      )
      .select("-_id")
      .lean()
      .exec();
  }
}
