export type Review = {
  id: string;
  sourceId: string;
  sourceKind: "order" | "offer";
  subjectId: string;
  subjectKind: "store" | "supplier" | "influencer";
  authorId: string;
  displayName: string;
  initialInput?: { rating: number; text: string };
  rating: number;
  text: string;
  reply: string;
  status: "pending" | "approved" | "rejected";
  moderationReason: string;
  version: number;
  createdAt: Date;
};
export function publicReview({
  initialInput: _initial,
  sourceId: _source,
  authorId: _author,
  moderationReason: _reason,
  version: _version,
  status: _status,
  ...review
}: Review) {
  return review;
}

export function privateReview({ initialInput: _initial, ...review }: Review) {
  return review;
}
