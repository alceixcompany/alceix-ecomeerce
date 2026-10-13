import { z } from "zod";
import { api } from "@/lib/http";
import type { ContactMessage } from "../utils/contact-message";
export const submitContact = (input: ContactMessage) =>
  api(
    "/contact",
    z.object({
      id: z.uuid(),
      status: z.literal("pending"),
      message: z.string(),
    }),
    { method: "POST", body: JSON.stringify(input) },
  );
