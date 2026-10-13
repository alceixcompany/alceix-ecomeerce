import type { PlatformStaff, AccountControl } from "../domain/platform-access";
import type { PageQuery } from "../../../shared/page";
import type { User } from "../domain/user";
export const USERS = Symbol("USERS");
export interface UsersRepository {
  list(
    query: PageQuery,
    staffOnly: boolean,
  ): Promise<{ items: User[]; total: number; page: number; pages: number }>;
  saveStaff(
    id: string,
    version: number,
    input: Omit<PlatformStaff, "version">,
  ): Promise<User | null>;
  saveControl(
    id: string,
    version: number,
    input: Omit<AccountControl, "version">,
  ): Promise<User | null>;
  lockRecipient(
    id: string,
    channel: "email" | "sms" | "whatsapp",
  ): Promise<boolean>;
  marketing(
    id: string,
    version: number,
    email: boolean,
    sms: boolean,
  ): Promise<User | null>;
  revokeMarketing(id: string): Promise<void>;
  verifyPhone(id: string, phone: string): Promise<boolean>;
  marketingList(
    channel: "email" | "sms",
    query: PageQuery,
  ): Promise<{ items: User[]; total: number; page: number; pages: number }>;
  marketingRecipients(
    channel: "email" | "sms",
    ids: string[],
    after: string,
    before: Date,
  ): Promise<User[]>;
  lock(id: string): Promise<boolean>;
  verifyEmail(id: string): Promise<void>;
  create(user: User): Promise<void>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  saveProfile(
    id: string,
    version: number,
    input: { name: string; phone: string; city: string; bio: string },
  ): Promise<User | null>;
  setPlatformAdmin(id: string, enabled: boolean): Promise<void>;
  changePassword(id: string, passwordHash: string): Promise<void>;
}
