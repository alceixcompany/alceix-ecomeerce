import type { PageQuery } from "../../../shared/page";
export type AuditEntry = {
  id: string;
  actorId: string;
  scopeId: string;
  action: string;
  subjectId: string;
  createdAt: Date;
};
export const AUDIT = Symbol("AUDIT");
export interface AuditRepository {
  append(entry: AuditEntry): Promise<void>;
  list(
    scopeId: string | undefined,
    query: PageQuery,
  ): Promise<{
    items: AuditEntry[];
    total: number;
    page: number;
    pages: number;
  }>;
}
