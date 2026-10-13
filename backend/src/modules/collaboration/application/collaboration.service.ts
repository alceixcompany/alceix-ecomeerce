import { Inject, Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import {
  COLLABORATION,
  type CollaborationRepository,
} from "./collaboration.repository";
import { NotificationsService } from "../../notifications/application/notifications.service";
import { FinanceService } from "../../finance/application/finance.service";
import { PartnersService } from "../../partners/application/partners.service";
import { StoresService } from "../../stores/application/stores.service";
import { AuditService } from "../../audit/application/audit.service";
import {
  TRANSACTIONS,
  type TransactionRunner,
} from "../../../shared/transactions";
import { AppError, conflict, notFound } from "../../../shared/errors";
import {
  offerTransition,
  type Link,
  type OfferTerms,
  type OfferAction,
  type Campaign,
} from "../domain/collaboration";
import type { PageQuery } from "../../../shared/page";
@Injectable()
export class CollaborationService {
  constructor(
    @Inject(COLLABORATION) private readonly repository: CollaborationRepository,
    private readonly partners: PartnersService,
    private readonly finance: FinanceService,
    private readonly notifications: NotificationsService,
    private readonly stores: StoresService,
    private readonly audit: AuditService,
    @Inject(TRANSACTIONS) private readonly tx: TransactionRunner,
  ) {}
  async scope(id: string, userId: string, write = false) {
    const link = await this.repository.link(id);
    if (!link) throw notFound();
    const partner = await this.partners.get(link.partnerId);
    if (partner.status !== "active" || partner.accountSuspended)
      throw notFound();
    let partnerAccess = false;
    try {
      await this.partners.access(
        partner.id,
        userId,
        write ? "collaboration-write" : "collaboration-read",
      );
      partnerAccess = true;
    } catch (error) {
      if (!(error instanceof AppError) || error.status !== 404) throw error;
    }
    if (partnerAccess) return { link, side: "partner" as const };
    const store = await this.stores.byId(link.storeId);
    await this.stores.owned(
      store.slug,
      userId,
      write ? "collaboration-write" : "collaboration-read",
    );
    return { link, side: "store" as const };
  }
  async active(storeId: string, partnerId: string) {
    const link = await this.repository.pair(storeId, partnerId);
    const partner = await this.partners.get(partnerId);
    if (
      !link ||
      link.status !== "active" ||
      partner.status !== "active" ||
      partner.accountSuspended
    )
      throw conflict("Aktif ortaklık gerekir.");
    return link;
  }
  async request(
    storeId: string,
    partnerId: string,
    userId: string,
    side: "store" | "partner",
  ) {
    return this.tx.run(async () => {
      const partner = await this.partners.get(partnerId),
        store = await this.stores.byId(storeId);
      if (partner.status !== "active" || partner.accountSuspended)
        throw notFound();
      if (side === "partner")
        await this.partners.access(partnerId, userId, "collaboration-write");
      else await this.stores.owned(store.slug, userId, "collaboration-write");
      const previous = await this.repository.pair(storeId, partnerId);
      if (previous) return previous;
      const link: Link = {
        id: randomUUID(),
        storeId,
        partnerId,
        requestedBy: side,
        status: "pending",
        version: 0,
        createdAt: new Date(),
      };
      await this.repository.createLink(link);
      await this.audit.append(userId, storeId, "link.request", link.id);
      return link;
    });
  }
  async links(
    scope: { storeId?: string; partnerId?: string },
    query: PageQuery,
  ) {
    return this.repository.links(scope, query);
  }
  async transition(
    id: string,
    userId: string,
    version: number,
    action: "accept" | "reject" | "close" | "reopen",
  ) {
    return this.tx.run(async () => {
      const { link, side } = await this.scope(id, userId, true);
      if (action === "reopen") {
        if (!["rejected", "closed"].includes(link.status)) throw conflict();
        const saved = await this.repository.saveLink(
          { ...link, status: "pending", requestedBy: side },
          version,
        );
        if (!saved) throw conflict();
        await this.audit.append(userId, link.storeId, "link.reopen", id);
        return saved;
      }
      if (
        (action !== "close" &&
          (link.status !== "pending" || side === link.requestedBy)) ||
        (action === "close" && !["pending", "active"].includes(link.status))
      )
        throw conflict("Ortaklık durum geçişi geçersiz.");
      if (action === "close" && (await this.repository.activeOffers(link.id)))
        throw conflict(
          "Önce aktif işleri tamamlayın veya karşılıklı iptal edin.",
        );
      const saved = await this.repository.saveLink(
        {
          ...link,
          status:
            action === "accept"
              ? "active"
              : action === "reject"
                ? "rejected"
                : "closed",
        },
        version,
      );
      if (!saved) throw conflict();
      await this.audit.append(userId, link.storeId, `link.${action}`, id);
      return saved;
    });
  }
  async messages(id: string, userId: string, query: PageQuery) {
    await this.scope(id, userId);
    const result = await this.repository.messages(id, query);
    return {
      ...result,
      items: result.items.map(({ actorId: _actor, ...message }) => message),
    };
  }
  async message(id: string, userId: string, messageId: string, text: string) {
    return this.tx.run(async () => {
      const { link, side } = await this.scope(id, userId, true);
      const previous = await this.repository.message(messageId);
      if (previous) {
        if (
          previous.linkId !== id ||
          previous.actorId !== userId ||
          previous.text !== text
        )
          throw conflict();
        const { actorId: _a, ...view } = previous;
        return view;
      }
      if (link.status !== "active")
        throw conflict("Mesaj için aktif ortaklık gerekir.");
      if (!(await this.repository.saveLink(link, link.version)))
        throw conflict();
      const message = {
        id: messageId,
        linkId: id,
        actorId: userId,
        side,
        text,
        createdAt: new Date(),
      };
      await this.repository.append(message);
      const recipient =
        side === "store"
          ? (await this.partners.get(link.partnerId)).ownerId
          : (await this.stores.byId(link.storeId)).ownerId;
      await this.notifications.notify(
        recipient,
        `message:${messageId}`,
        "Yeni ortaklık mesajı",
        text.slice(0, 160),
        side === "store"
          ? `${(await this.partners.get(link.partnerId)).kind === "supplier" ? "/tedarikci" : "/influencer"}/${(await this.partners.get(link.partnerId)).slug}/admin/mesajlar?link=${id}`
          : `/${(await this.stores.byId(link.storeId)).slug}/admin/mesajlar?link=${id}`,
      );
      const { actorId: _a, ...view } = message;
      return view;
    });
  }
  async offers(id: string, userId: string, query: PageQuery) {
    await this.scope(id, userId);
    return this.repository.offers(id, query);
  }
  async offer(
    id: string,
    userId: string,
    requestId: string,
    terms: OfferTerms,
  ) {
    return this.tx.run(async () => {
      const { link, side } = await this.scope(id, userId, true);
      if (link.status !== "active") throw conflict();
      const previous = await this.repository.offer(requestId);
      if (previous) {
        if (
          previous.linkId !== id ||
          previous.createdBy !== userId ||
          previous.sender !== side ||
          JSON.stringify({
            title: previous.title,
            brief: previous.brief,
            deliverables: previous.deliverables,
            deadline: previous.deadline,
            kind: previous.kind,
            feeCents: previous.feeCents,
          }) !== JSON.stringify(terms)
        )
          throw conflict();
        return previous;
      }
      if (terms.kind === "gift" && terms.feeCents !== 0)
        throw conflict("Hediye teklifinde ücret sıfır olmalı.");
      if (!(await this.repository.saveLink(link, link.version)))
        throw conflict();
      const offer = {
        ...terms,
        id: requestId,
        linkId: id,
        storeId: link.storeId,
        partnerId: link.partnerId,
        sender: side,
        createdBy: userId,
        funded: false,
        status: "pending" as const,
        contentUrl: "",
        report: "",
        version: 0,
        createdAt: new Date(),
      };
      await this.repository.createOffer(offer);
      await this.audit.append(userId, link.storeId, "offer.create", requestId);
      return offer;
    });
  }
  async offerAction(
    id: string,
    userId: string,
    version: number,
    action: OfferAction,
    contentUrl: string,
    report: string,
  ) {
    return this.tx.run(async () => {
      const offer = await this.repository.offer(id);
      if (!offer) throw notFound();
      const { link, side } = await this.scope(offer.linkId, userId, true);
      if (link.status !== "active") throw conflict();
      if (offer.cancelRequestedBy) throw conflict("İptal talebi sonuçlanmalı.");
      const status = offerTransition(offer.status, offer.sender, side, action);
      if (
        !status ||
        (action === "submit" &&
          (!contentUrl ||
            (offer.kind === "paid" && offer.feeCents > 0 && !offer.funded)))
      )
        throw conflict("Teklif geçişi veya teslimat bilgisi geçersiz.");
      if (action === "complete" && offer.funded)
        await this.finance.settleSupply(
          offer.storeId,
          offer.partnerId,
          `offer:${id}`,
          offer.feeCents,
          offer.commissionBasisPoints ?? 0,
        );
      const saved = await this.repository.saveOffer(
        {
          ...offer,
          status,
          ...(action === "submit" ? { contentUrl, report } : {}),
          ...(action === "revision" ? { report } : {}),
        },
        version,
      );
      if (!saved) throw conflict();
      await this.audit.append(userId, offer.storeId, `offer.${action}`, id);
      return saved;
    });
  }
  async completed(id: string) {
    const offer = await this.repository.offer(id);
    if (!offer || offer.status !== "completed")
      throw conflict("Tamamlanmış ortaklık gerekir.");
    return offer;
  }
  campaigns(storeId: string | undefined, query: PageQuery, publicOnly = false) {
    return this.repository.campaigns(storeId, query, publicOnly);
  }
  async campaign(id: string) {
    const campaign = await this.repository.campaign(id);
    if (!campaign) throw notFound();
    return campaign;
  }
  async createCampaign(
    storeId: string,
    userId: string,
    input: Pick<
      Campaign,
      "title" | "brief" | "format" | "budgetCents" | "deadline" | "slots"
    >,
  ) {
    const campaign = {
      ...input,
      id: randomUUID(),
      storeId,
      selected: 0,
      status: "open" as const,
      version: 0,
      createdAt: new Date(),
    };
    return this.tx.run(async () => {
      await this.repository.createCampaign(campaign);
      await this.audit.append(userId, storeId, "campaign.create", campaign.id);
      return campaign;
    });
  }
  async closeCampaign(
    id: string,
    storeId: string,
    userId: string,
    version: number,
  ) {
    return this.tx.run(async () => {
      const campaign = await this.campaign(id);
      if (campaign.storeId !== storeId) throw notFound();
      const saved = await this.repository.saveCampaign(
        { ...campaign, status: "closed" },
        version,
      );
      if (!saved) throw conflict();
      await this.audit.append(userId, storeId, "campaign.close", id);
      return saved;
    });
  }
  async apply(id: string, partnerId: string, userId: string, note: string) {
    return this.tx.run(async () => {
      const partner = await this.partners.access(
        partnerId,
        userId,
        "collaboration-write",
      );
      if (partner.kind !== "influencer") throw notFound();
      const campaign = await this.campaign(id);
      const previous = await this.repository.pairApplication(id, partnerId);
      if (previous) {
        if (previous.note !== note) throw conflict();
        return previous;
      }
      if (
        campaign.status !== "open" ||
        campaign.deadline < new Date().toISOString().slice(0, 10)
      )
        throw conflict("Kampanya başvuruya kapalı.");
      if (!(await this.repository.saveCampaign(campaign, campaign.version)))
        throw conflict();
      const application = {
        id: randomUUID(),
        campaignId: id,
        partnerId,
        note,
        status: "new" as const,
        version: 0,
        createdAt: new Date(),
      };
      await this.repository.createApplication(application);
      return application;
    });
  }
  async applications(id: string, storeId: string, query: PageQuery) {
    const campaign = await this.campaign(id);
    if (campaign.storeId !== storeId) throw notFound();
    return this.repository.applications(id, query);
  }
  async select(
    id: string,
    storeId: string,
    userId: string,
    version: number,
    status: "accepted" | "rejected",
  ) {
    return this.tx.run(async () => {
      const application = await this.repository.application(id);
      if (!application) throw notFound();
      const campaign = await this.campaign(application.campaignId);
      if (campaign.storeId !== storeId) throw notFound();
      if (application.status !== "new") throw conflict();
      if (
        status === "accepted" &&
        (campaign.status !== "open" || campaign.selected >= campaign.slots)
      )
        throw conflict("Kontenjan dolu veya kampanya kapalı.");
      if (
        !(await this.repository.saveCampaign(
          {
            ...campaign,
            selected: campaign.selected + (status === "accepted" ? 1 : 0),
          },
          campaign.version,
        ))
      )
        throw conflict();
      const saved = await this.repository.saveApplication(
        { ...application, status },
        version,
      );
      if (!saved) throw conflict();
      await this.audit.append(
        userId,
        storeId,
        `campaign.application.${status}`,
        id,
      );
      return saved;
    });
  }
  async ownApplications(partnerId: string, userId: string, query: PageQuery) {
    await this.partners.access(partnerId, userId, "collaboration-write");
    return this.repository.ownApplications(partnerId, query);
  }
  async withdrawApplication(
    id: string,
    partnerId: string,
    userId: string,
    version: number,
  ) {
    await this.partners.access(partnerId, userId, "collaboration-write");
    return this.tx.run(async () => {
      const application = await this.repository.application(id);
      if (!application || application.partnerId !== partnerId) throw notFound();
      if (application.status === "withdrawn") return application;
      if (!["new", "accepted"].includes(application.status)) throw conflict();
      const campaign = await this.campaign(application.campaignId);
      if (application.status === "accepted") {
        if (
          campaign.selected < 1 ||
          !(await this.repository.saveCampaign(
            { ...campaign, selected: campaign.selected - 1 },
            campaign.version,
          ))
        )
          throw conflict();
      }
      const saved = await this.repository.saveApplication(
        { ...application, status: "withdrawn" },
        version,
      );
      if (!saved) throw conflict();
      await this.audit.append(
        userId,
        campaign.storeId,
        "campaign.application.withdraw",
        id,
      );
      return saved;
    });
  }
  async fund(id: string, userId: string, version: number) {
    return this.tx.run(async () => {
      const offer = await this.repository.offer(id);
      if (!offer) throw notFound();
      const { side } = await this.scope(offer.linkId, userId, true);
      const store = await this.stores.byId(offer.storeId);
      await this.stores.owned(store.slug, userId);
      if (
        side !== "store" ||
        offer.status !== "active" ||
        offer.kind !== "paid"
      )
        throw conflict();
      if (offer.funded) return offer;
      const policy = await this.finance.policy(offer.storeId);
      if (policy.commissionBasisPoints === null)
        throw conflict("Komisyon politikası yapılandırılmalı.");
      await this.finance.fund(offer.storeId, `offer:${id}`, offer.feeCents);
      const saved = await this.repository.saveOffer(
        {
          ...offer,
          funded: true,
          commissionBasisPoints: policy.commissionBasisPoints,
        },
        version,
      );
      if (!saved) throw conflict();
      await this.audit.append(userId, offer.storeId, "offer.fund", id);
      return saved;
    });
  }
  async cancelOffer(
    id: string,
    userId: string,
    version: number,
    action: "request" | "approve" | "reject",
  ) {
    return this.tx.run(async () => {
      const offer = await this.repository.offer(id);
      if (!offer) throw notFound();
      const { side } = await this.scope(offer.linkId, userId, true);
      if (!["active", "submitted"].includes(offer.status)) throw conflict();
      if (
        action === "request"
          ? !!offer.cancelRequestedBy
          : !offer.cancelRequestedBy || offer.cancelRequestedBy === side
      )
        throw conflict();
      if (action === "approve" && offer.funded)
        await this.finance.unfund(offer.storeId, `offer:${id}`, offer.feeCents);
      const { cancelRequestedBy: _request, ...old } = offer;
      const saved = await this.repository.saveOffer(
        {
          ...old,
          status: action === "approve" ? "cancelled" : offer.status,
          cancelRequestedBy: action === "request" ? side : "",
        },
        version,
      );
      if (!saved) throw conflict();
      await this.audit.append(
        userId,
        offer.storeId,
        `offer.cancel-${action}`,
        id,
      );
      return saved;
    });
  }
}
