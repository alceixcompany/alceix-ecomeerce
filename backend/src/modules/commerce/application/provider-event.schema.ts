import { z } from "zod";
import { idSchema, moneySchema, text } from "../../../shared/validation";
export const providerEventSchema = z
  .object({
    eventId: idSchema,
    referenceId: idSchema,
    kind: z.enum([
      "payment.captured",
      "payment.failed",
      "refund.completed",
      "shipment.shipped",
      "shipment.delivered",
      "payout.completed",
      "payout.failed",
      "notification.sent",
      "notification.failed",
      "ai.completed",
      "ai.failed",
      "refund.failed",
      "invoice.issued",
      "invoice.credit-issued",
    ]),
    amountCents: moneySchema,
    currency: z.literal("TRY"),
    documentUrl: z
      .union([z.literal(""), z.url().startsWith("https://").max(1000)])
      .default(""),
    invoiceNumber: text(120).default(""),
    outputCount: z.number().int().min(0).max(4).default(0),
    providerReference: text(200).default(""),
    tracking: text(200).default(""),
    carrier: text(80).default(""),
    labelUrl: z
      .union([z.literal(""), z.url().startsWith("https://").max(1000)])
      .default(""),
  })
  .strict();
