export type Application = {
  id: string;
  type: "supplier" | "influencer";
  status: "pending";
  payload: Record<string, string>;
  createdAt: Date;
};
export const APPLICATIONS = Symbol("APPLICATIONS");
export interface ApplicationsRepository {
  create(application: Application): Promise<void>;
}
