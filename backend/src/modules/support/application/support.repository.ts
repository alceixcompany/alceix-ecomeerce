import type { ReplyDraft } from "../domain/draft";
import type { Ticket, TicketQuery } from "../domain/ticket";
export const SUPPORT = Symbol("SUPPORT");
export interface SupportRepository {
  create(ticket: Ticket): Promise<void>;
  find(storeId: string, id: string): Promise<Ticket | null>;
  list(
    storeId: string | undefined,
    query: TicketQuery,
    buyerId?: string,
  ): Promise<{ items: Ticket[]; total: number; page: number; pages: number }>;
  draft(
    storeId: string,
    ticketId: string,
    userId: string,
  ): Promise<ReplyDraft | null>;
  saveDraft(draft: ReplyDraft): Promise<ReplyDraft | null>;
  clearMatchingDraft(
    storeId: string,
    ticketId: string,
    userId: string,
    text: string,
    attachmentIds: string[],
  ): Promise<void>;
  save(ticket: Ticket, version: number): Promise<Ticket | null>;
}
