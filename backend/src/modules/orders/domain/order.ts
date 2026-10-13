export type OrderInput = {
  customer: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  customerNote: string;
  carrier: string;
  lines: { productId: string; quantity: number; variant: string }[];
};
export type Order = {
  id: string;
  storeId: string;
  buyerId: string;
  createdBy: string;
  requestId: string;
  initialInput: OrderInput;
  version: number;
  createdAt: Date;
  expiresAt: Date;
  customer: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  customerNote: string;
  internalNote: string;
  carrier: string;
  tracking: string;
  items: {
    productId: string;
    name: string;
    sku: string;
    variant: string;
    variantId?: string;
    image: string;
    quantity: number;
    unitCents: number;
  }[];
  currency: "TRY";
  discountCents: number;
  shippingCents: number;
  totalCents: number;
  payment: "pending" | "paid" | "refunded";
  shipment: "preparing" | "cancelled" | "shipped" | "delivered";
  reservation: "held" | "released" | "consumed";
  commissionBasisPoints?: number;
  returnDays?: number;
  pricingVersion?: number;
  pricingComplete?: boolean;
  checkoutLocked?: boolean;
  paidAt?: Date;
  deliveredAt?: Date;
  settleAt?: Date;
  financialState?: "pending" | "settled" | "refundPending" | "refunded";
  cancellationReason: "" | "merchant" | "buyer" | "expired" | "payment-failed";
};
export type OrderQuery = {
  page: number;
  limit: number;
  q: string;
  tab: "all" | "preparing" | "cancelled" | "shipped" | "delivered" | "requests";
  carrier: string;
  period: "all" | "7" | "30";
};
export function orderView({
  storeId: _store,
  buyerId: _buyer,
  createdBy: _actor,
  requestId: _key,
  initialInput: _initial,
  ...order
}: Order) {
  return {
    ...order,
    shippingQuoteAvailable: !!order.pricingComplete,
    paymentAvailable:
      !!order.pricingComplete &&
      order.payment === "pending" &&
      order.reservation === "held" &&
      order.shipment === "preparing" &&
      order.expiresAt.getTime() > Date.now(),
  };
}
export function buyerOrderView(order: Order) {
  const {
    internalNote: _private,
    commissionBasisPoints: _fee,
    pricingVersion: _pricing,
    financialState: _finance,
    ...view
  } = orderView(order);
  return view;
}

export type DailySale = {
  date: string;
  orders: number;
  grossCents: number;
  refundedCents: number;
  netCents: number;
};
