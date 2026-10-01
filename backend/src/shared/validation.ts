import { applyDecorators } from "@nestjs/common";
import { ApiBody } from "@nestjs/swagger";
import { z } from "zod";
import type { SchemaObject } from "@nestjs/swagger/dist/interfaces/open-api-spec.interface";
import { AppError } from "./errors";
export function parse<T>(schema: z.ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value);
  if (result.success) return result.data;
  const fields: Record<string, string[]> = {};
  for (const issue of result.error.issues) {
    const field = issue.path.join(".") || "form";
    (fields[field] ??= []).push(issue.message);
  }
  throw new AppError(
    422,
    "VALIDATION_ERROR",
    "Gönderilen alanları kontrol edin.",
    fields,
  );
}
export function ApiInput(schema: z.ZodType) {
  return applyDecorators(
    ApiBody({
      schema: z.toJSONSchema(schema, {
        unrepresentable: "any",
        io: "input",
      }) as SchemaObject,
    }),
  );
}
export const idSchema = z.uuid();
export const text = (length: number) => z.string().trim().max(length);
export const moneySchema = z.number().int().min(0).max(9_999_999_999);
export const listSchema = z
  .object({
    q: text(120).default(""),
    category: text(40).default("all"),
    status: z.enum(["all", "live", "draft", "critical"]).default("all"),
    sort: z
      .enum(["newest", "price-asc", "price-desc", "stock", "name", "featured"])
      .default("newest"),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(6),
    availability: z.enum(["all", "in-stock", "out-of-stock"]).default("all"),
    model: z.enum(["all", "own", "supplier"]).default("all"),
    min: z.coerce.number().int().min(0).max(9_999_999_999).optional(),
    max: z.coerce.number().int().min(0).max(9_999_999_999).optional(),
  })
  .strict()
  .refine(
    (query) =>
      query.min === undefined ||
      query.max === undefined ||
      query.min <= query.max,
    {
      path: ["max"],
      message: "Maximum price must be greater than or equal to minimum price.",
    },
  );
export type ListQuery = z.infer<typeof listSchema>;
