import { PARTNERS, type PartnersRepository } from "./partners.repository";
import { AuditService } from "../../audit/application/audit.service";
import { Inject, Injectable } from "@nestjs/common";
import { randomBytes, randomUUID, createHash } from "node:crypto";
import {
  PARTNER_MEMBERSHIPS,
  type PartnerMembershipsRepository,
} from "./partner-memberships.repository";
import { UsersService } from "../../users/application/users.service";
import {
  TRANSACTIONS,
  type TransactionRunner,
} from "../../../shared/transactions";
import type { Partner } from "../domain/partner";
import {
  partnerRoleAllows,
  partnerCapabilities,
  type PartnerRole,
  type PartnerCapability,
} from "../domain/partner-membership";
import { conflict, notFound, AppError } from "../../../shared/errors";
const digest = (token: string) =>
  createHash("sha256").update(token).digest("hex");
@Injectable()
export class PartnerTeamService {
  constructor(
    @Inject(PARTNER_MEMBERSHIPS)
    private readonly repository: PartnerMembershipsRepository,
    private readonly users: UsersService,
    @Inject(PARTNERS) private readonly partners: PartnersRepository,
    private readonly audit: AuditService,
    @Inject(TRANSACTIONS) private readonly tx: TransactionRunner,
  ) {}
  async can(partnerId: string, userId: string, permission: PartnerCapability) {
    const member = await this.repository.active(partnerId, userId);
    return member ? partnerRoleAllows(member.role, permission) : false;
  }
  partnerIds(userId: string) {
    return this.repository.partnerIds(userId);
  }
  async list(partner: Partner) {
    const owner = await this.users.findById(partner.ownerId);
    if (!owner) throw notFound();
    await this.tx.run(() => this.repository.expire(partner.id, new Date()));
    const members = await this.repository.list(partner.id);
    const items = [
      {
        id: "owner",
        name: owner.name,
        email: owner.email,
        role: "owner" as const,
        status: "active" as const,
        version: 0,
      },
    ];
    const others = await Promise.all(
      members.map(async (member) => {
        const user = member.userId
          ? await this.users.findById(member.userId)
          : null;
        return {
          id: member.id,
          name: user?.name ?? "Davet edilen kullanıcı",
          email: member.email,
          role: member.role,
          status: member.status,
          version: member.version,
          expiresAt: member.expiresAt ?? null,
        };
      }),
    );
    return { items: [...items, ...others] };
  }
  async invite(partner: Partner, email: string, role: PartnerRole) {
    const normalized = email.toLowerCase(),
      owner = await this.users.findById(partner.ownerId);
    if (!owner) throw notFound();
    if (owner.email === normalized)
      throw conflict("Firma sahibi zaten ekipte.");
    const token = randomBytes(32).toString("hex");
    const member = {
      id: randomUUID(),
      partnerId: partner.id,
      email: normalized,
      role,
      status: "invited" as const,
      version: 0,
      tokenHash: digest(token),
      expiresAt: new Date(Date.now() + 7 * 86400000),
      createdAt: new Date(),
    };
    await this.tx.run(async () => {
      await this.users.lock(partner.ownerId);
      const current = await this.partners.find(partner.id);
      if (!current || current.status !== "active" || current.accountSuspended)
        throw notFound();
      await this.repository.expire(partner.id, new Date());
      await this.repository.create(member);
      await this.audit.append(
        partner.ownerId,
        partner.id,
        "partner.team.invite",
        member.id,
      );
    });
    return {
      id: member.id,
      token,
      expiresAt: member.expiresAt,
      message:
        "Davet bağlantısı hazırlandı. E-posta gönderilmedi; bağlantıyı davet ettiğiniz kişiyle paylaşın.",
    };
  }
  async accept(token: string, userId: string) {
    return this.tx.run(async () => {
      const invite = await this.repository.byToken(digest(token));
      if (!invite)
        throw new AppError(
          422,
          "INVALID_INVITE",
          "Davet geçersiz, kullanılmış veya süresi dolmuş.",
        );
      const partner = await this.partners.find(invite.partnerId);
      if (!partner || partner.status !== "active" || partner.accountSuspended)
        throw notFound();
      await this.users.lock(userId);
      const user = await this.users.findById(userId);
      if (!user || user.email !== invite.email) throw notFound();
      const member = await this.repository.accept(
        invite.id,
        digest(token),
        userId,
      );
      if (!member) throw conflict();
      return { partnerId: member.partnerId, message: "Davet kabul edildi." };
    });
  }
  async role(
    partnerId: string,
    id: string,
    version: number,
    role: PartnerRole,
  ) {
    const saved = await this.repository.role(partnerId, id, version, role);
    if (!saved) throw conflict();
    return { message: "Görev güncellendi." };
  }
  async remove(partnerId: string, id: string, version: number) {
    const removed = await this.tx.run(() =>
      this.repository.remove(partnerId, id, version),
    );
    if (!removed) throw conflict();
    return { message: "Ekip kaydı kaldırıldı." };
  }
  async reissue(partnerId: string, id: string, version: number) {
    const token = randomBytes(32).toString("hex"),
      expiresAt = new Date(Date.now() + 7 * 86400000);
    const member = await this.repository.reissue(
      partnerId,
      id,
      version,
      digest(token),
      expiresAt,
    );
    if (!member) throw conflict();
    return {
      id,
      version: member.version,
      token,
      expiresAt,
      message:
        "Önceki bağlantı geçersiz kılındı. Yeni davet bağlantısı hazırlandı.",
    };
  }
  async status(
    partnerId: string,
    id: string,
    version: number,
    status: "active" | "paused",
    actorId: string,
  ) {
    return this.tx.run(async () => {
      if (!(await this.repository.status(partnerId, id, version, status)))
        throw conflict();
      await this.audit.append(actorId, partnerId, `partner.team.${status}`, id);
      return { message: "Üyelik durumu güncellendi." };
    });
  }
  async capabilities(partnerId: string, userId: string) {
    const member = await this.repository.active(partnerId, userId);
    return member
      ? partnerCapabilities.filter((capability) =>
          partnerRoleAllows(member.role, capability),
        )
      : [];
  }
}
