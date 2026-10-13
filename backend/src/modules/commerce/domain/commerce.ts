export type PaymentIntent = {
  id: string;
  storeId: string;
  orderId: string;
  actorId: string;
  amountCents: number;
  couponCode?: string;
  providerReference?: string;
  commissionBasisPoints: number;
  status: "pending" | "failed" | "captured" | "captured-late" | "refunded";
  version: number;
  createdAt: Date;
};
export type Shipment = {
  id: string;
  storeId: string;
  orderId: string;
  status: "requested" | "shipped" | "delivered";
  carrier: string;
  tracking: string;
  labelUrl: string;
  version: number;
  createdAt: Date;
};
export type RefundRequest = {
  id: string;
  storeId: string;
  orderId: string;
  buyerId: string;
  paymentId: string;
  reason: string;
  status: "requested" | "approved" | "rejected" | "received" | "refunded";
  restock: boolean;
  settled: boolean;
  late: boolean;
  version: number;
  createdAt: Date;
};
export type ProviderEventInput = {
  eventId: string;
  referenceId: string;
  kind:
    | "payment.captured"
    | "payment.failed"
    | "refund.completed"
    | "shipment.shipped"
    | "shipment.delivered"
    | "payout.completed"
    | "payout.failed"
    | "notification.sent"
    | "notification.failed"
    | "ai.completed"
    | "ai.failed"
    | "refund.failed"
    | "invoice.issued"
    | "invoice.credit-issued";
  amountCents: number;
  currency: "TRY";
  tracking: string;
  carrier: string;
  labelUrl: string;
  providerReference?: string;
  outputCount?: number;
  documentUrl?: string;
  invoiceNumber?: string;
};

export type CheckoutReceipt = {
  id: string;
  storeId: string;
  buyerId: string;
  orderId: string;
  input: string;
  createdAt: Date;
};
