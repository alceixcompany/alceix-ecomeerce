import type { LiveSession, LiveMessage } from "../domain/live-session";
import type { PageQuery } from "../../../shared/page";
export const LIVE_SUPPORT = Symbol("LIVE_SUPPORT");
export interface LiveRepository {
  find(id: string): Promise<LiveSession | null>;
  activeCount(userId: string): Promise<number>;
  create(session: LiveSession): Promise<void>;
  save(session: LiveSession, version: number): Promise<LiveSession | null>;
  list(
    query: PageQuery,
    userId?: string,
  ): Promise<{
    items: LiveSession[];
    total: number;
    page: number;
    pages: number;
  }>;
  message(id: string): Promise<LiveMessage | null>;
  append(message: LiveMessage): Promise<void>;
  messages(
    sessionId: string,
    query: PageQuery,
  ): Promise<{
    items: LiveMessage[];
    total: number;
    page: number;
    pages: number;
  }>;
}
