import "server-only";
import { cookies } from "next/headers";
import { z } from "zod";
import { backendOrigin } from "@/config/backend";
import { decode, ApiError } from "./http";
export async function serverApi<T>(
  path: string,
  schema: z.ZodType<T>,
  authenticated = false,
) {
  const headers = new Headers();
  if (authenticated) headers.set("Cookie", (await cookies()).toString());
  let response: Response;
  try {
    response = await fetch(`${backendOrigin()}/api/v1${path}`, {
      headers,
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    throw new ApiError(503, "Backend bağlantısı kurulamadı.");
  }
  return decode(response, schema);
}
