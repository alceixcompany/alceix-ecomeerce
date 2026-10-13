import { Inject, Injectable, type OnModuleInit } from "@nestjs/common";
import { Schema, type Connection, type Model } from "mongoose";
import { DATABASE, MongoTransactions } from "../../../infrastructure/database";
import type { InvoicesRepository } from "../application/invoices.repository";
import type { Seller, Invoice } from "../domain/invoice";
@Injectable()
export class MongoInvoicesRepository
  implements InvoicesRepository, OnModuleInit
{
  private readonly sellers: Model<Seller>;
  private readonly invoices: Model<Invoice>;
  constructor(
    @Inject(DATABASE) db: Connection,
    private readonly tx: MongoTransactions,
  ) {
    this.sellers = db.model<Seller>(
      "InvoiceSeller",
      new Schema<Seller>(
        {
          storeId: { type: String, unique: true },
          legalName: String,
          taxNumber: String,
          taxOffice: String,
          address: String,
          vatBasisPoints: Number,
          version: Number,
        },
        { versionKey: false },
      ),
    );
    const invoice = new Schema<Invoice>(
      {
        id: { type: String, unique: true },
        storeId: String,
        orderId: { type: String, unique: true },
        actorId: String,
        amountCents: Number,
        status: String,
        refunded: Boolean,
        providerReference: String,
        number: String,
        documentUrl: String,
        creditJobId: String,
        creditDocumentUrl: String,
        version: Number,
        createdAt: Date,
      },
      { versionKey: false },
    );
    invoice.index({ creditJobId: 1 });
    this.invoices = db.model<Invoice>("Invoice", invoice);
  }
  async onModuleInit() {
    await this.sellers.init();
    await this.invoices.init();
  }
  seller(storeId: string) {
    return this.sellers
      .findOne({ storeId })
      .session(this.tx.session ?? null)
      .select("-_id")
      .lean()
      .exec();
  }
  saveSeller(seller: Seller, version: number) {
    const { storeId, version: _v, ...values } = seller;
    return this.sellers
      .findOneAndUpdate(
        { storeId, version },
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
  find(id: string) {
    return this.invoices
      .findOne({ id })
      .session(this.tx.session ?? null)
      .select("-_id")
      .lean()
      .exec();
  }
  order(orderId: string) {
    return this.invoices
      .findOne({ orderId })
      .session(this.tx.session ?? null)
      .select("-_id")
      .lean()
      .exec();
  }
  credit(creditJobId: string) {
    return this.invoices
      .findOne({ creditJobId })
      .session(this.tx.session ?? null)
      .select("-_id")
      .lean()
      .exec();
  }
  async create(invoice: Invoice) {
    await this.invoices.create([invoice], { session: this.tx.session });
  }
  save(invoice: Invoice, version: number) {
    const { id, version: _v, ...values } = invoice;
    return this.invoices
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
