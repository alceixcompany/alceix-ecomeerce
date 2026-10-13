import type { IntegrationJob, ProviderEvent } from "../domain/job";
import type { PageQuery } from "../../../shared/page";
export const JOBS = Symbol("JOBS");
export interface JobsRepository {
  reconciliationCandidate(now: Date): Promise<IntegrationJob | null>;
  find(id: string): Promise<IntegrationJob | null>;
  create(job: IntegrationJob): Promise<void>;
  claim(
    now: Date,
    leaseId: string,
    id?: string,
  ): Promise<IntegrationJob | null>;
  finish(job: IntegrationJob, leaseId: string): Promise<boolean>;
  defer(id: string): Promise<void>;
  complete(id: string, success: boolean): Promise<void>;
  retry(id: string, ownerId: string): Promise<IntegrationJob | null>;
  cancel(
    id: string,
    ownerId: string,
    confirmed?: boolean,
  ): Promise<IntegrationJob | null>;
  list(
    scopeId: string,
    query: PageQuery,
  ): Promise<{
    items: IntegrationJob[];
    total: number;
    page: number;
    pages: number;
  }>;
  event(id: string): Promise<ProviderEvent | null>;
  appendEvent(event: ProviderEvent): Promise<void>;
}
