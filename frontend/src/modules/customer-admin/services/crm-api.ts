import { z } from "zod";
import { api } from "@/lib/http";
import type { Customer, CrmSettings } from "../types/customer";
const customerSchema = z.object({
  id: z.uuid(),
  version: z.number().int(),
  name: z.string(),
  email: z.email(),
  phone: z.string(),
  city: z.string(),
  consent: z.boolean(),
  note: z.string(),
  orders: z.number().int(),
  spentCents: z.number().int(),
  daysSinceOrder: z.number().int(),
  joinedDays: z.number().int(),
  cartCents: z.number().int(),
  points: z.number().int(),
});
const settings = z.object({
  earnRate: z.number().int(),
  pointCents: z.number().int(),
  abandonedEnabled: z.boolean(),
  delayHours: z.number().int(),
  discount: z.number().int(),
  template: z.string(),
});
const list = z.object({
  items: z.array(customerSchema),
  total: z.number().int(),
  page: z.number().int(),
  pages: z.number().int(),
  limit: z.number().int(),
  metricsAvailable: z.boolean(),
});
const rules = z.object({ settings, version: z.number().int() });
const path = (slug: string) => `/stores/${encodeURIComponent(slug)}/crm`;
export const loadCustomers = (
  slug: string,
  query: URLSearchParams,
  signal?: AbortSignal,
) => api(`${path(slug)}/customers?${query}`, list, { signal });
export const loadCrmSettings = (slug: string, signal?: AbortSignal) =>
  api(`${path(slug)}/settings`, rules, { signal });
export function saveCustomer(
  slug: string,
  customer: Customer,
  create: boolean,
) {
  const { name, email, phone, city, consent, note } = customer;
  return api(
    `${path(slug)}/customers${create ? "" : `/${encodeURIComponent(customer.id)}`}`,
    customerSchema,
    {
      method: create ? "POST" : "PUT",
      body: JSON.stringify({
        name,
        email,
        phone,
        city,
        consent,
        note,
        ...(!create ? { version: customer.version ?? 0 } : {}),
      }),
    },
  );
}
export const saveCrmSettings = (
  slug: string,
  settings: CrmSettings,
  version: number,
) =>
  api(`${path(slug)}/settings`, rules, {
    method: "PUT",
    body: JSON.stringify({ settings, version }),
  });
export async function exportCustomers(slug: string, query: URLSearchParams) {
  const customers: Customer[] = [];
  const pages = new URLSearchParams(query);
  pages.set("limit", "100");
  pages.set("page", "1");
  let page = 1,
    totalPages = 1;
  do {
    pages.set("page", String(page));
    const result = await loadCustomers(slug, pages);
    customers.push(...result.items);
    totalPages = result.pages;
    page++;
  } while (page <= totalPages);
  return customers;
}
const communication = z.object({
  id: z.uuid(),
  kind: z.enum(["campaign", "email"]),
  segment: z.enum(["all", "vip", "new", "cart", "inactive"]),
  subject: z.string(),
  message: z.string(),
  version: z.number().int(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
export type CommunicationDraft = z.infer<typeof communication>;
export type CommunicationInput = Pick<
  CommunicationDraft,
  "kind" | "segment" | "subject" | "message"
>;
export const loadCommunicationDrafts = (
  slug: string,
  kind: CommunicationInput["kind"],
  signal?: AbortSignal,
) =>
  api(
    `${path(slug)}/communications?kind=${kind}&limit=5`,
    z.object({
      items: z.array(communication),
      total: z.number().int(),
      page: z.number().int(),
      pages: z.number().int(),
      limit: z.number().int(),
    }),
    { signal },
  );
export const createCommunicationDraft = (
  slug: string,
  input: CommunicationInput,
  requestId: string,
) =>
  api(`${path(slug)}/communications`, communication, {
    method: "POST",
    body: JSON.stringify({ ...input, requestId }),
  });
export const updateCommunicationDraft = (
  slug: string,
  draft: CommunicationDraft,
  input: CommunicationInput,
) =>
  api(`${path(slug)}/communications/${draft.id}`, communication, {
    method: "PUT",
    body: JSON.stringify({ ...input, version: draft.version }),
  });
export const loadCommunicationRecipients = (
  slug: string,
  segment: CommunicationInput["segment"],
  signal?: AbortSignal,
) =>
  api(
    `${path(slug)}/communication-recipients?segment=${segment}`,
    z.object({
      available: z.boolean(),
      total: z.number().int().nullable(),
      items: z.array(customerSchema),
    }),
    { signal },
  );
