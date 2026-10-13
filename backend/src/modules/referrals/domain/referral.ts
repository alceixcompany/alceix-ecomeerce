export type ReferralCodeInput = {
  ownerId: string;
  code: string;
  title: string;
  kind: "referral" | "campaign";
  rewardBps: number;
  discountBps: number;
  discountStoreId: string;
  discountUses: number;
  startsOn: string;
  endsOn: string;
  active: boolean;
  qualification: "merchant-first-settled-sale";
};
export type ReferralCode = ReferralCodeInput & {
  id: string;
  initialInput: ReferralCodeInput;
  couponId: string;
  version: number;
  createdAt: Date;
};
export type ReferralConversion = {
  id: string;
  codeId: string;
  ownerId: string;
  customerId: string;
  rewardBps: number;
  qualification: ReferralCode["qualification"];
  status: "registered" | "qualified" | "rejected";
  sourceId: string;
  commissionBaseCents: number;
  rewardCents: number;
  version: number;
  createdAt: Date;
};
