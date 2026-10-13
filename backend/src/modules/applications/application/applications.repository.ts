export type Application = {
  id: string;
  type: "supplier" | "influencer";
  status: "pending" | "approved" | "rejected";
  ownerId?: string;
  version?: number;
  decisionReason?: string;
  decidedBy?: string;
  decidedAt?: Date;
  payload: Record<string, string>;
  createdAt: Date;
};
export const APPLICATIONS = Symbol("APPLICATIONS");
export interface ApplicationsRepository {
  list(
    page: number,
    limit: number,
  ): Promise<{
    items: Application[];
    total: number;
    page: number;
    pages: number;
  }>;
  find(id: string): Promise<Application | null>;
  save(application: Application, version: number): Promise<Application | null>;
  owned(ownerId: string): Promise<Application[]>;
  create(application: Application): Promise<void>;
}
