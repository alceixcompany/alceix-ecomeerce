import { PartnerTeamService } from "./partner-team.service";
import type { PartnerCapability } from "../domain/partner-membership";
import { Inject, Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { PARTNERS, type PartnersRepository } from "./partners.repository";
import { ApplicationsService } from "../../applications/application/applications.service";
import { UsersService } from "../../users/application/users.service";
import { MediaService } from "../../media/application/media.service";
import { AuditService } from "../../audit/application/audit.service";
import {
  TRANSACTIONS,
  type TransactionRunner,
} from "../../../shared/transactions";
import { conflict, notFound } from "../../../shared/errors";
import { slugify } from "../../stores/domain/store";
import {
  partnerView,
  type Partner,
  type PartnerProfile,
  type SupplyInput,
} from "../domain/partner";
import type { PageQuery } from "../../../shared/page";
@Injectable()
export class PartnersService {
  constructor(
    @Inject(PARTNERS) private readonly repository: PartnersRepository,
    private readonly applications: ApplicationsService,
    private readonly team: PartnerTeamService,
    private readonly users: UsersService,
    private readonly media: MediaService,
    private readonly audit: AuditService,
    @Inject(TRANSACTIONS) private readonly tx: TransactionRunner,
  ) {}
  async owned(userId: string) {
    const owned = await this.repository.owned(userId),
      ids = await this.team.partnerIds(userId);
    const members = await Promise.all(
      ids
        .filter((id) => !owned.some((p) => p.id === id))
        .map((id) => this.get(id)),
    );
    return [
      ...owned,
      ...members.filter((p) => p.status === "active" && !p.accountSuspended),
    ];
  }
  async access(
    id: string,
    userId: string,
    capability: PartnerCapability,
    allowSuspended = false,
  ) {
    const partner = await this.get(id);
    if (
      (!allowSuspended &&
        (partner.status !== "active" || partner.accountSuspended)) ||
      (partner.ownerId !== userId &&
        !(await this.team.can(id, userId, capability)))
    )
      throw notFound();
    return partner;
  }

  async get(id: string) {
    const partner = await this.repository.find(id);
    if (!partner) throw notFound();
    return partner;
  }
  async owner(id: string, userId: string, allowSuspended = false) {
    const partner = await this.get(id);
    if (
      partner.ownerId !== userId ||
      (!allowSuspended &&
        (partner.status !== "active" || partner.accountSuspended))
    )
      throw notFound();
    return partner;
  }
  async public(slug: string) {
    const partner = await this.repository.bySlug(slug);
    if (!partner || partner.status !== "active" || partner.accountSuspended)
      throw notFound();
    return partnerView(partner);
  }
  administrativeList(kind: Partner["kind"], query: PageQuery) {
    return this.repository.list(kind, query, false);
  }
  async list(kind: Partner["kind"], query: PageQuery) {
    const result = await this.repository.list(kind, query);
    return { ...result, items: result.items.map(partnerView) };
  }
  async decide(
    id: string,
    version: number,
    decision: "approved" | "rejected",
    reason: string,
    actorId: string,
    assignedOwnerId?: string,
  ) {
    return this.tx.run(async () => {
      const application = await this.applications.get(id);
      if (!application) throw notFound();
      if (application.status !== "pending") {
        if (
          application.status === decision &&
          application.decisionReason === reason &&
          (!assignedOwnerId || assignedOwnerId === application.ownerId)
        )
          return {
            application,
            partner: await this.repository.byApplication(id),
          };
        throw conflict();
      }
      if ((application.version ?? 0) !== version) throw conflict();
      if (
        assignedOwnerId &&
        ((application.ownerId && application.ownerId !== assignedOwnerId) ||
          !(await this.users.findById(assignedOwnerId)))
      )
        throw conflict("Başvuru sahibi eşleşmiyor.");
      const ownerId = application.ownerId || assignedOwnerId;
      if (
        decision === "approved" &&
        (!ownerId ||
          !(await this.users.findById(ownerId)) ||
          (await this.users.findById(ownerId))?.accountControl?.status ===
            "paused")
      )
        throw conflict(
          "Onaydan önce geçerli başvuru sahibi hesabını bağlayın.",
        );
      if (decision === "approved") await this.users.lock(ownerId!);
      const saved = await this.applications.save(
        {
          ...application,
          ownerId,
          status: decision,
          decisionReason: reason,
          decidedBy: actorId,
          decidedAt: new Date(),
        },
        version,
      );
      if (!saved) throw conflict();
      let partner: Partner | null = null;
      if (decision === "approved") {
        const name = (
          application.payload.companyName ||
          application.payload.name ||
          "Partner"
        ).slice(0, 150);
        partner = {
          id: randomUUID(),
          ownerId: ownerId!,
          applicationId: id,
          kind: application.type,
          slug: `${slugify(name).slice(0, 40)}-${randomUUID().slice(0, 8)}`,
          name,
          bio: "",
          city: "",
          category: application.payload.category || "",
          logo: "",
          links: [],
          portfolio: [],
          status: "active",
          version: 0,
          createdAt: new Date(),
        };
        await this.repository.create(partner);
      }
      await this.audit.append(actorId, id, `application.${decision}`, id);
      return { application: saved, partner };
    });
  }
  async save(
    id: string,
    userId: string,
    version: number,
    profile: PartnerProfile,
  ) {
    return this.tx.run(async () => {
      const partner = await this.access(id, userId, "settings-write");
      await this.media.assertOwned(id, [profile.logo], "logo");
      await this.media.assertOwned(
        id,
        profile.portfolio.map((work) => work.image),
        "product",
      );
      const saved = await this.repository.save(
        { ...partner, ...profile },
        version,
      );
      if (!saved) throw conflict();
      await this.audit.append(userId, id, "partner.profile", id);
      return saved;
    });
  }
  async status(
    id: string,
    version: number,
    status: Partner["status"],
    actorId: string,
  ) {
    return this.tx.run(async () => {
      const partner = await this.get(id);
      const saved = await this.repository.save({ ...partner, status }, version);
      if (!saved) throw conflict();
      await this.audit.append(actorId, id, `partner.${status}`, id);
      return saved;
    });
  }
  async products(id: string, query: PageQuery, publicOnly: boolean) {
    const partner = await this.get(id);
    if (
      partner.kind !== "supplier" ||
      partner.status !== "active" ||
      partner.accountSuspended
    )
      throw notFound();
    const result = await this.repository.products(id, query, publicOnly);
    return publicOnly
      ? {
          ...result,
          items: result.items.map(
            ({ partnerId: _p, reservedStock: _r, version: _v, ...product }) =>
              product,
          ),
        }
      : result;
  }
  async product(id: string, productId: string) {
    const product = await this.repository.product(id, productId);
    if (!product) throw notFound();
    return product;
  }
  async saveProduct(
    id: string,
    userId: string,
    input: SupplyInput,
    productId?: string,
    version?: number,
  ) {
    return this.tx.run(async () => {
      const partner = await this.access(id, userId, "catalog-write");
      if (partner.kind !== "supplier") throw notFound();
      await this.media.assertOwned(id, input.images, "product");
      if (input.active && (!input.priceCents || !input.images.length))
        throw conflict("Yayın için fiyat ve görsel gerekir.");
      const product = productId
        ? await this.product(id, productId)
        : {
            id: randomUUID(),
            partnerId: id,
            reservedStock: 0,
            version: 0,
            createdAt: new Date(),
          };
      const next = { ...product, ...input };
      if (productId) {
        const saved = await this.repository.saveProduct(next, version!);
        if (!saved) throw conflict();
        return saved;
      }
      await this.repository.createProduct(next);
      return next;
    });
  }
  async reserve(id: string, productId: string, quantity: number) {
    const partner = await this.get(id);
    if (partner.status !== "active" || partner.kind !== "supplier")
      throw conflict();
    const product = await this.repository.reserve(id, productId, quantity);
    if (!product)
      throw conflict("Tedarik stoğu yetersiz veya minimum adet sağlanmadı.");
    return product;
  }
  async release(id: string, productId: string, quantity: number) {
    if (!(await this.repository.release(id, productId, quantity)))
      throw conflict();
  }
  async consume(id: string, productId: string, quantity: number) {
    if (!(await this.repository.consume(id, productId, quantity)))
      throw conflict();
  }
  suspendOwner(ownerId: string, suspended: boolean) {
    return this.repository.suspendOwner(ownerId, suspended);
  }
}
