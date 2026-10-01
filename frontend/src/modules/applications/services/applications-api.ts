import { z } from "zod";
import { api } from "@/lib/http";
export function submitApplication(
  type: "supplier" | "influencer",
  values: Record<string, string>,
) {
  return api(
    `/applications/${type}`,
    z.object({
      id: z.uuid(),
      status: z.literal("pending"),
      message: z.string(),
    }),
    { method: "POST", body: JSON.stringify(values) },
  );
}
export function formValues(form: HTMLFormElement): Record<string, string> {
  return Object.fromEntries(
    [...new FormData(form).entries()].filter(
      (pair): pair is [string, string] => typeof pair[1] === "string",
    ),
  );
}
