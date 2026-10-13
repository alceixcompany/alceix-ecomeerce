import { Inject, Injectable } from "@nestjs/common";
import { z } from "zod";
import { CONFIG, type AppConfig } from "../../../config/config";
import { unavailable } from "../../../shared/errors";
import type {
  GatewayPort,
  GatewayOperation,
  GatewayRequests,
  GatewayResults,
} from "../application/gateway.port";
const reference = z.string().min(1).max(200),
  https = z.url().startsWith("https://").max(1000);
const schemas = {
  "events.pull": z
    .object({
      events: z
        .array(
          z
            .object({
              payload: z.string().min(2).max(16384),
              timestamp: z.string().regex(/^\d{10}$/),
              signature: z.string().regex(/^[a-f0-9]{64}$/),
            })
            .strict(),
        )
        .max(10),
    })
    .strict(),
  "identity.phone-start": z
    .object({ providerReference: reference, expiresAt: z.iso.datetime() })
    .strict(),
  "identity.phone-verify": z.object({ verified: z.boolean() }).strict(),
  "invoice.create": z.object({ providerReference: reference }).strict(),
  "invoice.credit": z.object({ providerReference: reference }).strict(),
  "shipping.cancel": z.object({ cancelled: z.boolean() }).strict(),
  "ai.cancel": z.object({ cancelled: z.boolean() }).strict(),
  "payout.cancel": z.object({ cancelled: z.boolean() }).strict(),
  "payment.create": z
    .object({ providerReference: reference, checkoutUrl: https })
    .strict(),
  "payment.refund": z.object({ providerReference: reference }).strict(),
  "shipping.quote": z
    .object({
      carrier: z.string().min(1).max(80),
      amountCents: z.number().int().min(0).max(9999999999),
      expiresAt: z.iso.datetime(),
    })
    .strict(),
  "shipping.create": z
    .object({
      providerReference: reference,
      tracking: reference,
      labelUrl: https,
    })
    .strict(),
  "payout.create": z.object({ providerReference: reference }).strict(),
  "identity.onboard": z
    .object({ providerReference: reference, verificationUrl: https })
    .strict(),
  "identity.verify": z
    .object({
      bankReference: reference,
      verified: z.boolean(),
      actorId: z.uuid(),
      scopeId: z.uuid(),
      holderName: z.string().trim().min(2).max(150),
    })
    .strict(),
  "ai.generate": z.object({ providerReference: reference }).strict(),
  "notification.send": z.object({ providerReference: reference }).strict(),
};
@Injectable()
export class HttpGateway implements GatewayPort {
  constructor(@Inject(CONFIG) private readonly config: AppConfig) {}
  configured() {
    return !!this.config.gateway;
  }
  async request<K extends GatewayOperation>(
    operation: K,
    input: GatewayRequests[K],
    key: string,
  ): Promise<GatewayResults[K]> {
    const settings = this.config.gateway;
    if (!settings)
      throw unavailable("Entegrasyon ağ geçidi henüz yapılandırılmadı.");
    try {
      const response = await fetch(`${settings.url}/v1/${operation}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${settings.token}`,
          "Content-Type": "application/json",
          "Idempotency-Key": key,
        },
        body: JSON.stringify(input),
        signal: AbortSignal.timeout(10000),
        redirect: "error",
      });
      if (!response.ok) throw new Error();
      const size = Number(response.headers.get("content-length") ?? 0);
      if (size > 65536) throw new Error();
      if (!response.body) throw new Error();
      const reader = response.body.getReader(),
        chunks: Buffer[] = [];
      let bytes = 0;
      while (true) {
        const part = await reader.read();
        if (part.done) break;
        bytes += part.value.length;
        if (bytes > 65536) {
          await reader.cancel();
          throw new Error();
        }
        chunks.push(Buffer.from(part.value));
      }
      const content = Buffer.concat(chunks).toString("utf8");
      return schemas[operation].parse(JSON.parse(content)) as GatewayResults[K];
    } catch {
      throw unavailable(
        "Entegrasyon yanıtı alınamadı veya doğrulanamadı; aynı işlem kimliğiyle yeniden deneyin.",
      );
    }
  }
  async image(referenceId: string, index: number) {
    const settings = this.config.gateway;
    if (!settings) throw unavailable("Görsel sağlayıcı yapılandırması eksik.");
    if (
      !/^[a-f0-9-]{36}$/.test(referenceId) ||
      !Number.isInteger(index) ||
      index < 0 ||
      index > 3
    )
      throw unavailable("Görsel kaynağı geçersiz.");
    try {
      const response = await fetch(
        `${settings.url}/v1/results/${referenceId}/images/${index}`,
        {
          headers: { Authorization: `Bearer ${settings.token}` },
          signal: AbortSignal.timeout(10000),
          redirect: "error",
        },
      );
      if (!response.ok || !response.body) throw new Error();
      const reader = response.body.getReader(),
        chunks: Buffer[] = [];
      let size = 0;
      while (true) {
        const part = await reader.read();
        if (part.done) break;
        size += part.value.length;
        if (size > 15 * 1024 * 1024) {
          await reader.cancel();
          throw new Error();
        }
        chunks.push(Buffer.from(part.value));
      }
      return Buffer.concat(chunks);
    } catch {
      throw unavailable(
        "Üretilen görsel indirilemedi veya boyut sınırını aşıyor.",
      );
    }
  }
}
