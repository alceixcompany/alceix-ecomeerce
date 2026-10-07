export type ShipmentStatus = "preparing" | "shipped" | "delivered" | "cancelled";
export type PaymentStatus = "paid" | "pending" | "refunded";
export type OrderLine = { name: string; sku: string; variant: string; image: string; quantity: number; unitCents: number };
export type AdminOrder = {
  id: string; createdAt: string; customer: string; email: string; phone: string;
  address: string; city: string; customerNote: string; internalNote: string;
  items: OrderLine[]; discountCents: number; shippingCents: number;
  shipment: ShipmentStatus; payment: PaymentStatus; carrier: string; tracking: string;
  request?: { type: "return" | "exchange"; reason: string; status: "pending" | "approved" | "rejected" };
};
