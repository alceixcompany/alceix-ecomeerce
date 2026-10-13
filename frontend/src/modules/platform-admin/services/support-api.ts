import { z } from "zod";
import { api, ApiError, decode, messageSchema } from "@/lib/http";
import { ticketSchema } from "@/modules/customer-admin";
const ticket = ticketSchema.extend({ storeId: z.uuid() });
export type PlatformTicket = z.infer<typeof ticket>;
const path = (item: Pick<PlatformTicket, "storeId" | "id">) =>
  `/platform/stores/${item.storeId}/support/${item.id}`;
export const loadPlatformTickets = (
  query: URLSearchParams,
  signal?: AbortSignal,
) =>
  api(
    `/platform/support?${query}`,
    z.object({
      items: z.array(ticket),
      total: z.number().int(),
      page: z.number().int(),
      pages: z.number().int(),
      limit: z.number().int(),
    }),
    { signal },
  );
export const loadPlatformTicket = (
  storeId: string,
  id: string,
  signal?: AbortSignal,
) => api(path({ storeId, id }), ticket, { signal });
export async function replyPlatformTicket(
  item: PlatformTicket,
  text: string,
  messageId: string,
) {
  const result = await api(`${path(item)}/replies`, ticketSchema, {
    method: "POST",
    body: JSON.stringify({ version: item.version, text, messageId }),
  });
  return { ...result, storeId: item.storeId };
}
export async function statusPlatformTicket(
  item: PlatformTicket,
  status: PlatformTicket["status"],
) {
  const result = await api(`${path(item)}/status`, ticketSchema, {
    method: "PUT",
    body: JSON.stringify({ version: item.version, status }),
  });
  return { ...result, storeId: item.storeId };
}
export async function downloadPlatformAttachment(
  item: PlatformTicket,
  id: string,
) {
  try {
    const response = await fetch(
      `/api/v1${path(item)}/attachments/${encodeURIComponent(id)}`,
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
