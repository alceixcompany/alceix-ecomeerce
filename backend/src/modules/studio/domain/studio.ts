export type StudioPolicy = {
  id: string;
  costs: { model: number; scene: number; upscale: number };
  creditPriceCents: number;
  version: number;
};
export type StudioInput = {
  productId: string;
  sourceUrl: string;
  mode: "model" | "scene" | "upscale";
  prompt: string;
  ratio: "1:1" | "4:5" | "16:9";
};
export type StudioJob = StudioInput & {
  id: string;
  scopeId: string;
  targetKind?: "store" | "supplier";
  actorId: string;
  cost: number;
  policyVersion: number;
  status: "queued" | "completed" | "failed" | "cancelled";
  outputs: string[];
  allocations: { lotId: string; credits: number }[];
  version: number;
  createdAt: Date;
};
export type CreditLot = {
  id: string;
  scopeId: string;
  available: number;
  held: number;
  spent: number;
  refundable: boolean;
};
export type CreditPurchase = {
  id: string;
  scopeId: string;
  actorId: string;
  credits: number;
  amountCents: number;
  status: "pending" | "failed" | "paid" | "refund-pending" | "refunded";
  providerReference: string;
  refundId?: string;
  createdAt: Date;
};
