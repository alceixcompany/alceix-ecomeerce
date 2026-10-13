import { z } from "zod";
import { text } from "./validation";
export const pageQuery = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    q: text(120).default(""),
  })
  .strict();
export type PageQuery = z.infer<typeof pageQuery>;
export const literalSearch = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
