import type { ReferralCode, ReferralConversion } from "../domain/referral";
import type { PageQuery } from "../../../shared/page";
export const REFERRALS = Symbol("REFERRALS");
export interface ReferralsRepository {
  code(id: string): Promise<ReferralCode | null>;
  byCode(code: string): Promise<ReferralCode | null>;
  createCode(code: ReferralCode): Promise<void>;
  saveCode(code: ReferralCode, version: number): Promise<ReferralCode | null>;
  conversionByCustomer(customerId: string): Promise<ReferralConversion | null>;
  conversionBySource(sourceId: string): Promise<ReferralConversion | null>;
  createConversion(conversion: ReferralConversion): Promise<void>;
  saveConversion(
    conversion: ReferralConversion,
    version: number,
  ): Promise<ReferralConversion | null>;
  codes(
    query: PageQuery,
    ownerId?: string,
  ): Promise<{
    items: ReferralCode[];
    total: number;
    page: number;
    pages: number;
  }>;
  conversions(
    query: PageQuery,
    ownerId?: string,
  ): Promise<{
    items: ReferralConversion[];
    total: number;
    page: number;
    pages: number;
  }>;
}
