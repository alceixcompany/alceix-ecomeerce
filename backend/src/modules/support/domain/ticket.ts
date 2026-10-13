export type TicketStatus = "open" | "waiting" | "resolved";
export type Attachment = {
  id: string;
  name: string;
  mime: string;
  size: number;
};
export type SupportMessage = {
  id: string;
  author: "merchant" | "support" | "customer";
  actorId?: string;
  name: string;
  text: string;
  createdAt: Date;
  attachments: Attachment[];
};
export type Ticket = {
  id: string;
  storeId: string;
  scopeKind?: "store" | "partner";
  buyerId?: string;
  assignedTo?: string;
  internalNote?: string;
  version: number;
  channel: "platform" | "customer";
  category: string;
  subject: string;
  priority: "normal" | "high";
  status: TicketStatus;
  requester: string;
  createdAt: Date;
  updatedAt: Date;
  messages: SupportMessage[];
};
export type TicketInput = Pick<
  Ticket,
  "channel" | "category" | "subject" | "priority"
> & { text: string };
export type TicketQuery = {
  channel: "all" | "platform" | "customer";
  status: "all" | TicketStatus;
  priority: "all" | "normal" | "high";
  q: string;
  page: number;
  limit: number;
};
export function ticketView({
  storeId: _scope,
  buyerId: _buyer,
  assignedTo: _assignee,
  internalNote: _note,
  ...ticket
}: Ticket) {
  return {
    ...ticket,
    messages: ticket.messages.map(({ actorId: _actor, ...message }) => message),
  };
}
