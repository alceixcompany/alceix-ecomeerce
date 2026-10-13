export type Link = {
  id: string;
  storeId: string;
  partnerId: string;
  requestedBy: "store" | "partner";
  status: "pending" | "active" | "rejected" | "closed";
  version: number;
  createdAt: Date;
};
export type Message = {
  id: string;
  linkId: string;
  actorId: string;
  side: "store" | "partner";
  text: string;
  createdAt: Date;
};
export type OfferTerms = {
  title: string;
  brief: string;
  deliverables: string;
  deadline: string;
  kind: "paid" | "gift";
  feeCents: number;
};
export type Offer = OfferTerms & {
  id: string;
  linkId: string;
  storeId: string;
  partnerId: string;
  sender: "store" | "partner";
  status:
    | "pending"
    | "active"
    | "submitted"
    | "completed"
    | "rejected"
    | "withdrawn"
    | "cancelled";
  contentUrl: string;
  report: string;
  createdBy?: string;
  funded?: boolean;
  cancelRequestedBy?: "store" | "partner" | "";
  commissionBasisPoints?: number;
  version: number;
  createdAt: Date;
};
export type OfferAction =
  "accept" | "reject" | "withdraw" | "submit" | "complete" | "revision";
export function offerTransition(
  status: Offer["status"],
  sender: Offer["sender"],
  side: Offer["sender"],
  action: OfferAction,
): Offer["status"] | undefined {
  if (status === "pending" && side !== sender && action === "accept")
    return "active";
  if (status === "pending" && side !== sender && action === "reject")
    return "rejected";
  if (status === "pending" && side === sender && action === "withdraw")
    return "withdrawn";
  if (status === "active" && side === "partner" && action === "submit")
    return "submitted";
  if (status === "submitted" && side === "store" && action === "complete")
    return "completed";
  if (status === "submitted" && side === "store" && action === "revision")
    return "active";
}
export type Campaign = {
  id: string;
  storeId: string;
  title: string;
  brief: string;
  format: string;
  budgetCents: number;
  deadline: string;
  slots: number;
  selected: number;
  status: "open" | "closed";
  version: number;
  createdAt: Date;
};
export type CampaignApplication = {
  id: string;
  campaignId: string;
  partnerId: string;
  note: string;
  status: "new" | "accepted" | "rejected" | "withdrawn";
  version: number;
  createdAt: Date;
};
