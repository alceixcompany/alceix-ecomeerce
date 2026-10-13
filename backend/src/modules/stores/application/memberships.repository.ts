import type { Membership, TeamRole } from "../domain/membership";
export const MEMBERSHIPS = Symbol("MEMBERSHIPS");
export interface MembershipsRepository {
  expire(storeId: string, now: Date): Promise<void>;
  reissue(
    storeId: string,
    id: string,
    version: number,
    hash: string,
    expiresAt: Date,
  ): Promise<Membership | null>;
  list(storeId: string): Promise<Membership[]>;
  active(storeId: string, userId: string): Promise<Membership | null>;
  storeIds(userId: string): Promise<string[]>;
  create(member: Membership): Promise<void>;
  byToken(hash: string): Promise<Membership | null>;
  accept(id: string, hash: string, userId: string): Promise<Membership | null>;
  role(
    storeId: string,
    id: string,
    version: number,
    role: TeamRole,
  ): Promise<Membership | null>;
  remove(storeId: string, id: string, version: number): Promise<boolean>;
}
