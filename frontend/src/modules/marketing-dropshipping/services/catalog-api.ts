import { z } from "zod";
import { api } from "@/lib/http";
export function importSample(slug: string, sampleId: string) {
  return api(
    `/stores/${encodeURIComponent(slug)}/sample-products`,
    z.object({ id: z.uuid(), status: z.literal("draft") }),
    { method: "POST", body: JSON.stringify({ sampleId }) },
  );
}
