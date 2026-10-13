import {
  platformAccess,
  type PlatformStaff,
  type AccountControl,
  type PlatformPage,
} from "../domain/platform-access";
import type { PageQuery } from "../../../shared/page";
import { Injectable, Inject } from "@nestjs/common";
import { USERS, type UsersRepository } from "./users.repository";
import { conflict, notFound } from "../../../shared/errors";
import type { User } from "../domain/user";
@Injectable()
export class UsersService {
  constructor(@Inject(USERS) private readonly repository: UsersRepository) {}
  async lock(id: string) {
    if (!(await this.repository.lock(id))) throw notFound();
  }
  verifyEmail(id: string) {
    return this.repository.verifyEmail(id);
  }
  create(user: User) {
    return this.repository.create(user);
  }
  findByEmail(email: string) {
    return this.repository.findByEmail(email);
  }
  findById(id: string) {
    return this.repository.findById(id);
  }
  async profile(id: string) {
    const user = await this.findById(id);
    if (!user) throw notFound();
    return {
      name: user.name,
      email: user.email,
      phone: user.phone ?? "",
      city: user.city ?? "",
      bio: user.bio ?? "",
      version: user.profileVersion ?? 0,
      emailVerified: !!user.emailVerifiedAt,
    };
  }
  async saveProfile(
    id: string,
    version: number,
    input: { name: string; phone: string; city: string; bio: string },
  ) {
    const saved = await this.repository.saveProfile(id, version, input);
    if (!saved) throw conflict();
    return this.profile(id);
  }
  async requirePlatformAdmin(id: string) {
    const user = await this.findById(id);
    if (!user?.platformAdmin) throw notFound();
  }
  setPlatformAdmin(id: string, enabled: boolean) {
    return this.repository.setPlatformAdmin(id, enabled);
  }
  changePassword(id: string, hash: string) {
    return this.repository.changePassword(id, hash);
  }
  access(user: User) {
    return platformAccess(user);
  }
  async requirePlatformAccess(id: string, page?: PlatformPage, write = false) {
    const user = await this.findById(id);
    const access = user && platformAccess(user);
    if (
      !access ||
      (page ? !access.pages.includes(page) : access.pages.length === 0) ||
      (write && !access.write) ||
      user?.accountControl?.status === "paused"
    )
      throw notFound();
  }
  async administrativeList(query: PageQuery, staffOnly = false) {
    const result = await this.repository.list(query, staffOnly);
    return {
      ...result,
      items: result.items.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        emailVerified: !!user.emailVerifiedAt,
        access: platformAccess(user),
        staffVersion: user.platformStaff?.version ?? 0,
        staffStatus:
          user.platformStaff?.status ?? (user.platformAdmin ? "active" : null),
        control: user.accountControl ?? {
          status: "active",
          verified: false,
          note: "",
          version: 0,
        },
      })),
    };
  }
  async staff(
    id: string,
    version: number,
    input: Omit<PlatformStaff, "version">,
  ) {
    const saved = await this.repository.saveStaff(id, version, input);
    if (!saved)
      throw conflict("Hesap değişmiş veya kök yönetici düzenlenemez.");
    return { id: saved.id, ...saved.platformStaff! };
  }
  async control(
    id: string,
    version: number,
    input: Omit<AccountControl, "version">,
  ) {
    const saved = await this.repository.saveControl(id, version, input);
    if (!saved)
      throw conflict("Hesap değişmiş veya kök yönetici düzenlenemez.");
    return { id: saved.id, ...saved.accountControl! };
  }
  async preferences(id: string) {
    const user = await this.findById(id);
    if (!user) throw notFound();
    return {
      ...(user.marketing ?? { email: false, sms: false, version: 0 }),
      emailVerified: !!user.emailVerifiedAt,
      phoneVerified: !!user.phoneVerifiedAt,
    };
  }
  async savePreferences(
    id: string,
    version: number,
    email: boolean,
    sms: boolean,
  ) {
    const user = await this.findById(id);
    if (
      !user ||
      (email && !user.emailVerifiedAt) ||
      (sms && !user.phoneVerifiedAt)
    )
      throw conflict("İzin vermeden önce iletişim adresini doğrulayın.");
    if (!(await this.repository.marketing(id, version, email, sms)))
      throw conflict();
    return this.preferences(id);
  }
  revokeMarketing(id: string) {
    return this.repository.revokeMarketing(id);
  }
  verifyPhone(id: string, phone: string) {
    return this.repository.verifyPhone(id, phone);
  }
  async eligibleRecipient(id: string, channel: "email" | "sms" | "whatsapp") {
    const user = await this.findById(id);
    if (
      !user ||
      user.accountControl?.status === "paused" ||
      !(channel === "email"
        ? user.marketing?.email && user.emailVerifiedAt
        : user.marketing?.sms && user.phoneVerifiedAt)
    )
      return null;
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone ?? "",
      consent: true,
    };
  }
  async marketingRecipients(
    channel: "email" | "sms",
    ids: string[],
    after: string,
    before: Date,
  ) {
    const rows = await this.repository.marketingRecipients(
      channel,
      ids,
      after,
      before,
    );
    return rows.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone ?? "",
      consent: true,
    }));
  }

  lockRecipient(id: string, channel: "email" | "sms" | "whatsapp") {
    return this.repository.lockRecipient(id, channel);
  }

  async marketingList(channel: "email" | "sms", query: PageQuery) {
    const result = await this.repository.marketingList(channel, query);
    return {
      ...result,
      items: result.items.map((user) => ({
        id: user.id,
        name: user.name,
        recipient: channel === "email" ? user.email : (user.phone ?? ""),
      })),
    };
  }
}
