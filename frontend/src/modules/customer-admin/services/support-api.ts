import { z } from "zod";
import { api, ApiError, decode, messageSchema } from "@/lib/http";
const attachment = z
  .object({
    id: z.uuid(),
    name: z.string(),
    mime: z.enum(["image/webp", "application/pdf", "text/plain"]),
    size: z.number().int(),
  })
  .transform((file) => ({ ...file, data: "" }));
const message = z.object({
  id: z.uuid(),
  author: z.enum(["merchant", "support", "customer"]),
  name: z.string(),
  text: z.string(),
  createdAt: z.iso.datetime(),
  attachments: z.array(attachment),
});
export const ticketSchema = z.object({
  id: z.uuid(),
  version: z.number().int(),
  channel: z.enum(["platform", "customer"]),
  category: z.string(),
  subject: z.string(),
  priority: z.enum(["normal", "high"]),
  status: z.enum(["open", "waiting", "resolved"]),
  requester: z.string(),
  createdAt: z.iso.datetime(),
  messages: z.array(message),
});
const list = z.object({
  items: z.array(ticketSchema),
  total: z.number().int(),
  page: z.number().int(),
  pages: z.number().int(),
  limit: z.number().int(),
});
const path = (slug: string) => `/stores/${encodeURIComponent(slug)}/support`;
export const loadTickets = (
  slug: string,
  query: URLSearchParams,
  signal?: AbortSignal,
) => api(`${path(slug)}?${query}`, list, { signal });
export const createTicket = (
  slug: string,
  input: {
    channel: "platform" | "customer";
    category: string;
    subject: string;
    priority: "normal" | "high";
    text: string;
  },
) =>
  api(path(slug), ticketSchema, {
    method: "POST",
    body: JSON.stringify(input),
  });
export const replyTicket = (
  slug: string,
  id: string,
  version: number,
  messageId: string,
  text: string,
  attachments: string[] = [],
) =>
  api(`${path(slug)}/${encodeURIComponent(id)}/replies`, ticketSchema, {
    method: "POST",
    body: JSON.stringify({ version, messageId, text, attachments }),
  });
export const statusTicket = (
  slug: string,
  id: string,
  version: number,
  status: "open" | "waiting" | "resolved",
) =>
  api(`${path(slug)}/${encodeURIComponent(id)}/status`, ticketSchema, {
    method: "PUT",
    body: JSON.stringify({ version, status }),
  });

export function uploadSupportAttachment(slug: string, file: File) {
  const body = new FormData();
  body.set("file", file);
  return api(`${path(slug)}/attachments`, attachment, { method: "POST", body });
}
export async function downloadSupportAttachment(slug: string, id: string) {
  try {
    const response = await fetch(
      `/api/v1${path(slug)}/attachments/${encodeURIComponent(id)}`,
      {
        credentials: "same-origin",
        cache: "no-store",
        signal: AbortSignal.timeout(15000),
      },
    );
    if (!response.ok) await decode(response, messageSchema);
    return await response.blob();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(503, "Dosya indirilemedi. Yeniden deneyin.");
  }
}

export const loadTicket = (slug: string, id: string, signal?: AbortSignal) =>
  api(`${path(slug)}/${encodeURIComponent(id)}`, ticketSchema, { signal });
const draftSchema = z.object({
  text: z.string(),
  version: z.number().int(),
  attachments: z.array(attachment),
});
export const loadReplyDraft = (
  slug: string,
  id: string,
  signal?: AbortSignal,
) =>
  api(`${path(slug)}/${encodeURIComponent(id)}/draft`, draftSchema, { signal });
export const saveReplyDraft = (
  slug: string,
  id: string,
  version: number,
  text: string,
  files: string[],
) =>
  api(`${path(slug)}/${encodeURIComponent(id)}/draft`, draftSchema, {
    method: "PUT",
    body: JSON.stringify({ version, text, attachments: files }),
  });
