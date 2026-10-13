export type Coupon = {
  id: string;
  storeId: string;
  code: string;
  allowedBuyerId?: string;
  kind: "fixed" | "percent" | "basis-points";
  amount: number;
  minimumCents: number;
  limitUses: number;
  used: number;
  expiresAt: Date;
  startsAt?: Date;
  active: boolean;
  reusableAfterRefund: boolean;
  version: number;
  createdAt: Date;
};
export type Redemption = {
  orderId: string;
  couponId: string;
  buyerId: string;
  discountCents: number;
  status: "held" | "consumed" | "released" | "refunded";
};
