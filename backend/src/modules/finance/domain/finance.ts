export type CommercePolicy = {
  scopeId: string;
  commissionBasisPoints: number | null;
  returnDays: number | null;
  shippingMode: "unconfigured" | "fixed" | "provider";
  fixedShippingCents: number;
  version: number;
};
export type Posting = { account: string; deltaCents: number };
export type Journal = {
  id: string;
  scopeId: string;
  kind: string;
  referenceId: string;
  postings: Posting[];
  createdAt: Date;
};
export type BankProfile = {
  scopeId: string;
  owner: string;
  maskedIban: string;
  bankReference: string;
  version: number;
  verifiedAt: Date;
};
export type Withdrawal = {
  id: string;
  scopeId: string;
  actorId: string;
  amountCents: number;
  bankReference: string;
  status: "review" | "pending" | "paid" | "failed" | "cancelled" | "rejected";
  reviewedBy?: string;
  reviewedAt?: Date;
  reviewReason?: string;
  version: number;
  createdAt: Date;
};
export function commission(amount: number, basisPoints: number) {
  return Number((BigInt(amount) * BigInt(basisPoints)) / 10000n);
}

export type BankVerificationReceipt = {
  id: string;
  fingerprint: string;
  profile: BankProfile;
};
