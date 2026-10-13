import type {
  PartnerMembership,
  PartnerRole,
} from "../domain/partner-membership";
export const PARTNER_MEMBERSHIPS = Symbol("PARTNER_MEMBERSHIPS");
export interface PartnerMembershipsRepository {
  status(
    partnerId: string,
    id: string,
    version: number,
    status: "active" | "paused",
  ): Promise<boolean>;
  expire(partnerId: string, now: Date): Promise<void>;
  reissue(
    partnerId: string,
    id: string,
    version: number,
    hash: string,
    expiresAt: Date,
  ): Promise<PartnerMembership | null>;
  list(partnerId: string): Promise<PartnerMembership[]>;
  active(partnerId: string, userId: string): Promise<PartnerMembership | null>;
  partnerIds(userId: string): Promise<string[]>;
  create(member: PartnerMembership): Promise<void>;
  byToken(hash: string): Promise<PartnerMembership | null>;
  accept(
    id: string,
    hash: string,
    userId: string,
  ): Promise<PartnerMembership | null>;
  role(
    partnerId: string,
    id: string,
    version: number,
    role: PartnerRole,
  ): Promise<PartnerMembership | null>;
  remove(partnerId: string, id: string, version: number): Promise<boolean>;
}
