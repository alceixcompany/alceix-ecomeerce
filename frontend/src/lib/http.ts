import { z } from "zod";
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code = "REQUEST_FAILED",
  ) {
    super(message);
  }
}
const errorSchema = z.object({
  message: z.string(),
  code: z.string().optional(),
});
export async function decode<T>(
  response: Response,
  schema: z.ZodType<T>,
): Promise<T> {
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const error = errorSchema.safeParse(body);
    throw new ApiError(
      response.status,
      error.success
        ? error.data.message
        : "İşlem tamamlanamadı. Lütfen tekrar deneyin.",
      error.success ? error.data.code : undefined,
    );
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success)
    throw new ApiError(502, "Sunucudan beklenmeyen bir yanıt alındı.");
  return parsed.data;
}
export async function api<T>(
  path: string,
  schema: z.ZodType<T>,
  options: RequestInit = {},
): Promise<T> {
  try {
    const headers = new Headers(options.headers);
    if (options.body && !(options.body instanceof FormData))
      headers.set("Content-Type", "application/json");
    return await decode(
      await fetch(`/api/v1${path}`, {
        ...options,
        headers,
        credentials: "same-origin",
        cache: "no-store",
        signal: options.signal ? AbortSignal.any([options.signal, AbortSignal.timeout(15000)]) : AbortSignal.timeout(15000),
      }),
      schema,
    );
  } catch (error) {
    if (
      error instanceof ApiError ||
      (error instanceof DOMException && error.name === "AbortError")
    )
      throw error;
    throw new ApiError(503, "Sunucuya ulaşılamadı. Lütfen tekrar deneyin.");
  }
}
export const messageSchema = z.object({ message: z.string() });
export function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "İşlem tamamlanamadı.";
}
