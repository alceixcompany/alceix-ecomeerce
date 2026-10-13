export type LiveSession = {
  id: string;
  userId: string;
  name: string;
  source: "store" | "supplier" | "creator" | "buyer";
  sourceId: string;
  subject: string;
  status: "waiting" | "active" | "closed";
  assignedTo: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  messages: number;
};
export type LiveMessage = {
  id: string;
  sessionId: string;
  actorId: string;
  sender: "customer" | "support";
  name: string;
  text: string;
  createdAt: Date;
};
