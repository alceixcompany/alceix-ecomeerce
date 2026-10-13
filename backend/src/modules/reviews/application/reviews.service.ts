import { Inject, Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { REVIEWS, type ReviewsRepository } from "./reviews.repository";
import { publicReview, privateReview, type Review } from "../domain/review";
import { OrdersService } from "../../orders/application/orders.service";
import { CollaborationService } from "../../collaboration/application/collaboration.service";
import { StoresService } from "../../stores/application/stores.service";
import { PartnersService } from "../../partners/application/partners.service";
import { UsersService } from "../../users/application/users.service";
import { AuditService } from "../../audit/application/audit.service";
import {
  TRANSACTIONS,
  type TransactionRunner,
} from "../../../shared/transactions";
import { conflict, notFound } from "../../../shared/errors";
import type { PageQuery } from "../../../shared/page";
@Injectable()
export class ReviewsService {
  constructor(
    @Inject(REVIEWS) private readonly repository: ReviewsRepository,
    private readonly orders: OrdersService,
    private readonly collaboration: CollaborationService,
    private readonly stores: StoresService,
    private readonly partners: PartnersService,
    private readonly users: UsersService,
    private readonly audit: AuditService,
    @Inject(TRANSACTIONS) private readonly tx: TransactionRunner,
  ) {}
  async submit(
    actorId: string,
    sourceKind: Review["sourceKind"],
    sourceId: string,
    rating: number,
    text: string,
    storeId?: string,
  ) {
    return this.tx.run(async () => {
      let subjectId: string, subjectKind: Review["subjectKind"];
      if (sourceKind === "order") {
        if (!storeId) throw notFound();
        const order = await this.orders.get(storeId, sourceId, actorId);
        if (order.payment !== "paid" || order.shipment !== "delivered")
          throw conflict(
            "Yalnız teslim edilmiş gerçek satın alma değerlendirilebilir.",
          );
        subjectId = order.storeId;
        subjectKind = "store";
      } else {
        const offer = await this.collaboration.completed(sourceId),
          { side } = await this.collaboration.scope(
            offer.linkId,
            actorId,
            true,
          );
        if (side === "store") {
          const partner = await this.partners.get(offer.partnerId);
          subjectId = partner.id;
          subjectKind = partner.kind;
        } else {
          subjectId = offer.storeId;
          subjectKind = "store";
        }
      }
      const previous = await this.repository.bySource(sourceId, actorId);
      if (previous) {
        if (
          (previous.initialInput ?? previous).rating !== rating ||
          (previous.initialInput ?? previous).text !== text
        )
          throw conflict();
        return privateReview(previous);
      }
      const user = await this.users.findById(actorId);
      if (!user) throw notFound();
      const parts = user.name.trim().split(/\s+/),
        displayName =
          parts[0] + (parts.length > 1 ? ` ${parts.at(-1)![0]}.` : "");
      const review: Review = {
        id: randomUUID(),
        sourceId,
        sourceKind,
        subjectId,
        subjectKind,
        authorId: actorId,
        displayName,
        initialInput: { rating, text },
        rating,
        text,
        reply: "",
        status: "pending",
        moderationReason: "",
        version: 0,
        createdAt: new Date(),
      };
      await this.repository.create(review);
      await this.audit.append(actorId, subjectId, "review.submit", review.id);
      return privateReview(review);
    });
  }
  async list(subjectId: string, query: PageQuery, publicOnly: boolean) {
    const result = await this.repository.list(subjectId, query, publicOnly);
    return {
      ...result,
      items: result.items.map(publicOnly ? publicReview : privateReview),
    };
  }
  async edit(
    id: string,
    actorId: string,
    version: number,
    rating: number,
    text: string,
  ) {
    return this.tx.run(async () => {
      const review = await this.repository.find(id);
      if (!review || review.authorId !== actorId) throw notFound();
      const saved = await this.repository.save(
        {
          ...review,
          initialInput: review.initialInput ?? {
            rating: review.rating,
            text: review.text,
          },
          rating,
          text,
          status: "pending",
          moderationReason: "",
        },
        version,
      );
      if (!saved) throw conflict();
      return privateReview(saved);
    });
  }
  async reply(id: string, actorId: string, version: number, text: string) {
    return this.tx.run(async () => {
      const review = await this.repository.find(id);
      if (!review) throw notFound();
      if (review.subjectKind === "store") {
        const store = await this.stores.byId(review.subjectId);
        await this.stores.owned(store.slug, actorId);
      } else await this.partners.owner(review.subjectId, actorId);
      const saved = await this.repository.save(
        { ...review, reply: text },
        version,
      );
      if (!saved) throw conflict();
      return privateReview(saved);
    });
  }
  async moderate(
    id: string,
    actorId: string,
    version: number,
    status: "approved" | "rejected",
    reason: string,
  ) {
    return this.tx.run(async () => {
      const review = await this.repository.find(id);
      if (!review) throw notFound();
      const saved = await this.repository.save(
        { ...review, status, moderationReason: reason },
        version,
      );
      if (!saved) throw conflict();
      await this.audit.append(
        actorId,
        review.subjectId,
        `review.${status}`,
        id,
      );
      return privateReview(saved);
    });
  }
  async platform(query: PageQuery) {
    const result = await this.repository.list(undefined, query, false);
    return { ...result, items: result.items.map(privateReview) };
  }
}
