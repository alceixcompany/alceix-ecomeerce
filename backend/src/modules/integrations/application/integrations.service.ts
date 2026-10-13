import { Inject, Injectable } from "@nestjs/common";
import { createHmac, timingSafeEqual } from "node:crypto";
import { CONFIG, type AppConfig } from "../../../config/config";
import { AppError, unavailable } from "../../../shared/errors";
import {
  GATEWAY,
  type GatewayPort,
  type GatewayOperation,
  type GatewayRequests,
} from "./gateway.port";
@Injectable()
export class IntegrationsService {
  constructor(
    @Inject(GATEWAY) private readonly gateway: GatewayPort,
    @Inject(CONFIG) private readonly config: AppConfig,
  ) {}
  status() {
    return {
      configured: this.gateway.configured(),
      protocol: "alceix-gateway-v1",
    };
  }
  require() {
    if (!this.gateway.configured())
      throw unavailable("Sağlayıcı ağ geçidi yapılandırması eksik.");
  }
  image(referenceId: string, index: number) {
    return this.gateway.image(referenceId, index);
  }
  request<K extends GatewayOperation>(
    operation: K,
    input: GatewayRequests[K],
    key: string,
  ) {
    return this.gateway.request(operation, input, key);
  }
  verify(
    raw: Buffer | undefined,
    timestamp: string | undefined,
    signature: string | undefined,
  ) {
    const settings = this.config.gateway;
    if (!settings) throw unavailable("Webhook yapılandırması eksik.");
    if (
      !raw ||
      !timestamp ||
      !/^\d{10}$/.test(timestamp) ||
      Math.abs(Date.now() / 1000 - Number(timestamp)) > 300 ||
      !signature ||
      !/^[a-f0-9]{64}$/.test(signature)
    )
      throw new AppError(
        403,
        "INVALID_SIGNATURE",
        "Webhook imzası doğrulanamadı.",
      );
    const expected = createHmac("sha256", settings.webhookSecret)
      .update(timestamp + ".")
      .update(raw)
      .digest();
    if (!timingSafeEqual(expected, Buffer.from(signature, "hex")))
      throw new AppError(
        403,
        "INVALID_SIGNATURE",
        "Webhook imzası doğrulanamadı.",
      );
  }
}
