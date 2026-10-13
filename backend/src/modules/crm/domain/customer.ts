export type CustomerInput = {
  name: string;
  email: string;
  phone: string;
  city: string;
  consent: boolean;
  note: string;
};
export type Customer = CustomerInput & {
  id: string;
  storeId: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  consentUpdatedAt: Date;
  dispatchLock?: number;
  orders?: number;
  spentCents?: number;
  lastOrderAt?: Date | null;
  cartCents?: number;
  cartHash?: string;
  cartBuyerId?: string;
  cartUpdatedAt?: Date;
  cartExpiresAt?: Date;
  cartReminderAt?: Date;
};
export type CrmSettings = {
  earnRate: number;
  pointCents: number;
  abandonedEnabled: boolean;
  delayHours: number;
  discount: number;
  template: string;
};
export const defaultSettings: CrmSettings = {
  earnRate: 100,
  pointCents: 100,
  abandonedEnabled: false,
  delayHours: 24,
  discount: 10,
  template: "Merhaba {{ad}}, sepetindeki ürünler seni bekliyor.",
};
export type SettingsRecord = {
  storeId: string;
  version: number;
  settings: CrmSettings;
};
export type CustomerQuery = {
  q: string;
  segment: "all" | "vip" | "new" | "cart" | "inactive";
  spend: "all" | "high" | "low";
  last: "all" | "recent" | "inactive";
  page: number;
  limit: number;
};
export function customerView(
  customer: Customer,
  earnRate = defaultSettings.earnRate,
) {
  return {
    id: customer.id,
    version: customer.version,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    city: customer.city,
    consent: customer.consent,
    note: customer.note,
    orders: customer.orders ?? 0,
    spentCents: customer.spentCents ?? 0,
    daysSinceOrder: customer.lastOrderAt
      ? Math.max(
          0,
          Math.floor((Date.now() - customer.lastOrderAt.getTime()) / 86400000),
        )
      : 0,
    joinedDays: Math.max(
      0,
      Math.floor((Date.now() - customer.createdAt.getTime()) / 86400000),
    ),
    cartCents:
      customer.cartExpiresAt && customer.cartExpiresAt.getTime() > Date.now()
        ? (customer.cartCents ?? 0)
        : 0,
    points: Math.floor((customer.spentCents ?? 0) / (earnRate * 100)),
  };
}

export type OrderMetric = {
  id: string;
  storeId: string;
  email: string;
  version: number;
  paid: boolean;
  totalCents: number;
  createdAt: Date;
};
export type CartMetricInput = {
  hash: string;
  email: string;
  buyerId: string;
  totalCents: number;
  updatedAt: Date;
  expiresAt: Date;
};
