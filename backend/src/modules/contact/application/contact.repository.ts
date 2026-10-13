export type ContactInput = {
  name: string;
  email: string;
  phone: string;
  store: string;
  topic: "store" | "supplier" | "influencer" | "technical" | "corporate";
  message: string;
  consent: true;
};
export type ContactSubmission = ContactInput & {
  id: string;
  createdAt: Date;
  status: "pending" | "review" | "resolved";
  version?: number;
  internalNote?: string;
};
export const CONTACT = Symbol("CONTACT");
export interface ContactRepository {
  find(id: string): Promise<ContactSubmission | null>;
  save(
    id: string,
    version: number,
    input: { status: ContactSubmission["status"]; internalNote: string },
  ): Promise<ContactSubmission | null>;
  list(
    page: number,
    limit: number,
  ): Promise<{
    items: ContactSubmission[];
    total: number;
    page: number;
    pages: number;
  }>;
  create(submission: ContactSubmission): Promise<void>;
}
