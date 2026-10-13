import type { Coupon, Redemption } from "../domain/coupon";
import type { PageQuery } from "../../../shared/page";
export const COUPONS = Symbol("COUPONS");
export interface CouponsRepository {
  get(id: string): Promise<Coupon | null>;
  byCode(storeId: string, code: string): Promise<Coupon | null>;
  create(coupon: Coupon): Promise<void>;
  save(coupon: Coupon, version: number): Promise<Coupon | null>;
  list(
    storeId: string,
    query: PageQuery,
  ): Promise<{ items: Coupon[]; total: number; page: number; pages: number }>;
  redemption(orderId: string): Promise<Redemption | null>;
  buyerRedemption(
    couponId: string,
    buyerId: string,
  ): Promise<Redemption | null>;
  createRedemption(redemption: Redemption): Promise<void>;
  saveRedemption(
    redemption: Redemption,
    status: Redemption["status"],
  ): Promise<boolean>;
}
