import { Inject, Injectable, type OnModuleInit } from "@nestjs/common";
import {
  Schema,
  type Connection,
  type Model,
  type QueryFilter,
} from "mongoose";
import { DATABASE, MongoTransactions } from "../../../infrastructure/database";
import type { CollaborationRepository } from "../application/collaboration.repository";
import type {
  Link,
  Message,
  Offer,
  Campaign,
  CampaignApplication,
} from "../domain/collaboration";
import { literalSearch, type PageQuery } from "../../../shared/page";
@Injectable()
export class MongoCollaborationRepository
  implements CollaborationRepository, OnModuleInit
{
  private readonly connections: Model<Link>;
  private readonly chat: Model<Message>;
  private readonly proposals: Model<Offer>;
  private readonly campaignsModel: Model<Campaign>;
  private readonly applicationsModel: Model<CampaignApplication>;
  constructor(
    @Inject(DATABASE) db: Connection,
    private readonly tx: MongoTransactions,
  ) {
    const link = new Schema<Link>(
      {
        id: { type: String, unique: true },
        storeId: String,
        partnerId: String,
        requestedBy: String,
        status: String,
        version: Number,
        createdAt: Date,
      },
      { versionKey: false },
    );
    link.index({ storeId: 1, partnerId: 1 }, { unique: true });
    link.index({ storeId: 1, createdAt: -1, id: 1 });
    link.index({ partnerId: 1, createdAt: -1, id: 1 });
    this.connections = db.model<Link>("PartnerLink", link);
    const message = new Schema<Message>(
      {
        id: { type: String, unique: true },
        linkId: String,
        actorId: String,
        side: String,
        text: String,
        createdAt: Date,
      },
      { versionKey: false },
    );
    message.index({ linkId: 1, createdAt: -1, id: 1 });
    this.chat = db.model<Message>("PartnerMessage", message);
    const offer = new Schema<Offer>(
      {
        id: { type: String, unique: true },
        linkId: String,
        storeId: String,
        partnerId: String,
        sender: String,
        status: String,
        title: String,
        brief: String,
        deliverables: String,
        deadline: String,
        kind: String,
        feeCents: Number,
        contentUrl: String,
        report: String,
        createdBy: String,
        funded: Boolean,
        cancelRequestedBy: String,
        commissionBasisPoints: Number,
        version: Number,
        createdAt: Date,
      },
      { versionKey: false },
    );
    offer.index({ linkId: 1, createdAt: -1, id: 1 });
    this.proposals = db.model<Offer>("CollaborationOffer", offer);
    const campaign = new Schema<Campaign>(
      {
        id: { type: String, unique: true },
        storeId: String,
        title: String,
        brief: String,
        format: String,
        budgetCents: Number,
        deadline: String,
        slots: Number,
        selected: Number,
        status: String,
        version: Number,
        createdAt: Date,
      },
      { versionKey: false },
    );
    campaign.index({ storeId: 1, createdAt: -1, id: 1 });
    campaign.index({ status: 1, deadline: 1 });
    this.campaignsModel = db.model<Campaign>("Campaign", campaign);
    const application = new Schema<CampaignApplication>(
      {
        id: { type: String, unique: true },
        campaignId: String,
        partnerId: String,
        note: String,
        status: String,
        version: Number,
        createdAt: Date,
      },
      { versionKey: false },
    );
    application.index({ campaignId: 1, partnerId: 1 }, { unique: true });
    application.index({ partnerId: 1, createdAt: -1, id: 1 });
    this.applicationsModel = db.model<CampaignApplication>(
      "CampaignApplication",
      application,
    );
  }
  async onModuleInit() {
    await Promise.all([
      this.connections.init(),
      this.chat.init(),
      this.proposals.init(),
      this.campaignsModel.init(),
      this.applicationsModel.init(),
    ]);
  }
  private async page<T extends { id: string; createdAt: Date }>(
    model: Model<T>,
    filter: QueryFilter<T>,
    query: PageQuery,
  ) {
    const total = await model.countDocuments(filter),
      pages = Math.max(1, Math.ceil(total / query.limit)),
      page = Math.min(query.page, pages);
    return {
      total,
      pages,
      page,
      items: (await model
        .find(filter)
        .sort({ createdAt: -1, id: 1 })
        .skip((page - 1) * query.limit)
        .limit(query.limit)
        .select("-_id")
        .lean()
        .exec()) as T[],
    };
  }
  link(id: string) {
    return this.connections
      .findOne({ id })
      .session(this.tx.session ?? null)
      .select("-_id")
      .lean()
      .exec();
  }
  pair(storeId: string, partnerId: string) {
    return this.connections
      .findOne({ storeId, partnerId })
      .session(this.tx.session ?? null)
      .select("-_id")
      .lean()
      .exec();
  }
  async createLink(link: Link) {
    await this.connections.create([link], { session: this.tx.session });
  }
  saveLink(link: Link, version: number) {
    const { id, version: _v, ...values } = link;
    return this.connections
      .findOneAndUpdate(
        { id, version },
        { $set: values, $inc: { version: 1 } },
        { returnDocument: "after", session: this.tx.session },
      )
      .select("-_id")
      .lean()
      .exec();
  }
  links(scope: { storeId?: string; partnerId?: string }, query: PageQuery) {
    return this.page(this.connections, scope, query);
  }
  message(id: string) {
    return this.chat
      .findOne({ id })
      .session(this.tx.session ?? null)
      .select("-_id")
      .lean()
      .exec();
  }
  async append(message: Message) {
    await this.chat.create([message], { session: this.tx.session });
  }
  messages(linkId: string, query: PageQuery) {
    return this.page(this.chat, { linkId }, query);
  }
  offer(id: string) {
    return this.proposals
      .findOne({ id })
      .session(this.tx.session ?? null)
      .select("-_id")
      .lean()
      .exec();
  }
  async createOffer(offer: Offer) {
    await this.proposals.create([offer], { session: this.tx.session });
  }
  saveOffer(offer: Offer, version: number) {
    const { id, version: _v, ...values } = offer;
    return this.proposals
      .findOneAndUpdate(
        { id, version },
        { $set: values, $inc: { version: 1 } },
        { returnDocument: "after", session: this.tx.session },
      )
      .select("-_id")
      .lean()
      .exec();
  }
  offers(linkId: string, query: PageQuery) {
    return this.page(this.proposals, { linkId }, query);
  }
  campaign(id: string) {
    return this.campaignsModel
      .findOne({ id })
      .session(this.tx.session ?? null)
      .select("-_id")
      .lean()
      .exec();
  }
  async createCampaign(campaign: Campaign) {
    await this.campaignsModel.create([campaign], { session: this.tx.session });
  }
  saveCampaign(campaign: Campaign, version: number) {
    const { id, version: _v, ...values } = campaign;
    return this.campaignsModel
      .findOneAndUpdate(
        { id, version },
        { $set: values, $inc: { version: 1 } },
        { returnDocument: "after", session: this.tx.session },
      )
      .select("-_id")
      .lean()
      .exec();
  }
  campaigns(
    storeId: string | undefined,
    query: PageQuery,
    publicOnly: boolean,
  ) {
    return this.page(
      this.campaignsModel,
      {
        ...(storeId ? { storeId } : {}),
        ...(publicOnly
          ? {
              status: "open" as const,
              deadline: { $gte: new Date().toISOString().slice(0, 10) },
            }
          : {}),
        ...(query.q
          ? { title: { $regex: literalSearch(query.q), $options: "i" } }
          : {}),
      },
      query,
    );
  }
  application(id: string) {
    return this.applicationsModel
      .findOne({ id })
      .session(this.tx.session ?? null)
      .select("-_id")
      .lean()
      .exec();
  }
  pairApplication(campaignId: string, partnerId: string) {
    return this.applicationsModel
      .findOne({ campaignId, partnerId })
      .session(this.tx.session ?? null)
      .select("-_id")
      .lean()
      .exec();
  }
  async createApplication(application: CampaignApplication) {
    await this.applicationsModel.create([application], {
      session: this.tx.session,
    });
  }
  saveApplication(application: CampaignApplication, version: number) {
    const { id, version: _v, ...values } = application;
    return this.applicationsModel
      .findOneAndUpdate(
        { id, version },
        { $set: values, $inc: { version: 1 } },
        { returnDocument: "after", session: this.tx.session },
      )
      .select("-_id")
      .lean()
      .exec();
  }
  applications(campaignId: string, query: PageQuery) {
    return this.page(this.applicationsModel, { campaignId }, query);
  }
  ownApplications(partnerId: string, query: PageQuery) {
    return this.page(this.applicationsModel, { partnerId }, query);
  }
  activeOffers(linkId: string) {
    return this.proposals
      .countDocuments({ linkId, status: { $in: ["active", "submitted"] } })
      .session(this.tx.session ?? null)
      .exec();
  }
}
