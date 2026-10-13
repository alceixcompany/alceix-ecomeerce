import { Inject, Injectable } from "@nestjs/common";
import { randomBytes, randomUUID, createHash } from "node:crypto";
import {
  MEMBERSHIPS,
  type MembershipsRepository,
} from "./memberships.repository";
import { UsersService } from "../../users/application/users.service";
import {
  TRANSACTIONS,
  type TransactionRunner,
} from "../../../shared/transactions";
import type { Store } from "../domain/store";
import {
  roleAllows,
  storeCapabilities,
  type TeamRole,
  type StoreCapability,
} from "../domain/membership";
import { conflict, notFound, AppError } from "../../../shared/errors";
const digest = (token: string) =>
  createHash("sha256").update(token).digest("hex");
@Injectable()
export class TeamService {
  constructor(
    @Inject(MEMBERSHIPS) private readonly repository: MembershipsRepository,
    private readonly users: UsersService,
    @Inject(TRANSACTIONS) private readonly tx: TransactionRunner,
  ) {}
  async can(storeId: string, userId: string, permission: StoreCapability) {
    const member = await this.repository.active(storeId, userId);
    return member ? roleAllows(member.role, permission) : false;
  }
  storeIds(userId: string) {
    return this.repository.storeIds(userId);
  }
  async list(store: Store) {
    const owner = await this.users.findById(store.ownerId);
    if (!owner) throw notFound();
    await this.tx.run(() => this.repository.expire(store.id, new Date()));
    const members = await this.repository.list(store.id);
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
  async invite(store: Store, email: string, role: TeamRole) {
    const normalized = email.toLowerCase(),
      owner = await this.users.findById(store.ownerId);
    if (!owner) throw notFound();
    if (owner.email === normalized)
      throw conflict("Mağaza sahibi zaten ekipte.");
    const token = randomBytes(32).toString("hex");
    const member = {
      id: randomUUID(),
      storeId: store.id,
      email: normalized,
      role,
      status: "invited" as const,
      version: 0,
      tokenHash: digest(token),
      expiresAt: new Date(Date.now() + 7 * 86400000),
      createdAt: new Date(),
    };
    await this.tx.run(async () => {
      await this.repository.expire(store.id, new Date());
      await this.repository.create(member);
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
      const user = await this.users.findById(userId);
      if (!user || user.email !== invite.email) throw notFound();
      const member = await this.repository.accept(
        invite.id,
        digest(token),
        userId,
      );
      if (!member) throw conflict();
      return { storeId: member.storeId, message: "Davet kabul edildi." };
    });
  }
  async role(storeId: string, id: string, version: number, role: TeamRole) {
    const saved = await this.repository.role(storeId, id, version, role);
    if (!saved) throw conflict();
    return { message: "Görev güncellendi." };
  }
  async remove(storeId: string, id: string, version: number) {
    const removed = await this.tx.run(() =>
      this.repository.remove(storeId, id, version),
    );
    if (!removed) throw conflict();
    return { message: "Ekip kaydı kaldırıldı." };
  }
  async reissue(storeId: string, id: string, version: number) {
    const token = randomBytes(32).toString("hex"),
      expiresAt = new Date(Date.now() + 7 * 86400000);
    const member = await this.repository.reissue(
      storeId,
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
  async capabilities(storeId: string, userId: string) {
    const member = await this.repository.active(storeId, userId);
    return member
      ? storeCapabilities.filter((capability) =>
          roleAllows(member.role, capability),
        )
      : [];
  }
}
