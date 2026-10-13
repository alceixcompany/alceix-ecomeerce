import { z } from "zod";
import { resolve } from "node:path";
export const CONFIG = Symbol("CONFIG");
const environment = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  MONGODB_URI: z.string().regex(/^mongodb(?:\+srv)?:\/\//),
  FRONTEND_ORIGIN: z.url().default("http://localhost:3000"),
  MEDIA_DIRECTORY: z.string().default("var/media"),
  WORKERS_ENABLED: z.enum(["true", "false"]).default("true"),
  UPLOAD_CLEANUP_ENABLED: z.enum(["true", "false"]).default("false"),
  UNCLAIMED_UPLOAD_HOURS: z.coerce.number().int().min(24).max(8760).default(72),
  SESSION_DAYS: z.coerce.number().int().min(1).max(30).default(7),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().min(1).max(65535).default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  MAIL_FROM: z.email().optional(),
  MAX_ACTIVE_RESERVATIONS: z.coerce.number().int().min(1).max(100).default(5),
  COMMERCE_GATEWAY_URL: z.url().optional(),
  COMMERCE_GATEWAY_TOKEN: z.string().min(32).optional(),
  COMMERCE_WEBHOOK_SECRET: z.string().min(32).optional(),
});
export type AppConfig = ReturnType<typeof loadConfig>;
export function loadConfig(env: NodeJS.ProcessEnv = process.env) {
  const values = environment.parse(env);
  const origin = new URL(values.FRONTEND_ORIGIN);
  if (origin.origin !== values.FRONTEND_ORIGIN)
    throw new Error(
      "FRONTEND_ORIGIN must be an origin without a path or trailing slash.",
    );
  if (values.NODE_ENV === "production" && origin.protocol !== "https:")
    throw new Error("Production requires HTTPS.");
  if (
    (values.SMTP_HOST && !values.MAIL_FROM) ||
    (!values.SMTP_HOST && values.MAIL_FROM)
  )
    throw new Error("SMTP_HOST and MAIL_FROM must be configured together.");
  const gatewayParts = [
    values.COMMERCE_GATEWAY_URL,
    values.COMMERCE_GATEWAY_TOKEN,
    values.COMMERCE_WEBHOOK_SECRET,
  ];
  if (gatewayParts.some(Boolean) && !gatewayParts.every(Boolean))
    throw new Error("All gateway settings must be configured together.");
  if (values.COMMERCE_GATEWAY_URL) {
    const gatewayUrl = new URL(values.COMMERCE_GATEWAY_URL);
    if (
      gatewayUrl.username ||
      gatewayUrl.password ||
      gatewayUrl.search ||
      gatewayUrl.hash ||
      gatewayUrl.pathname !== "/" ||
      (gatewayUrl.protocol !== "https:" &&
        !(
          values.NODE_ENV !== "production" &&
          ["localhost", "127.0.0.1", "[::1]"].includes(gatewayUrl.hostname)
        ))
    )
      throw new Error("Gateway must use HTTPS or a local development origin.");
  }
  return {
    environment: values.NODE_ENV,
    port: values.PORT,
    mongoUri: values.MONGODB_URI,
    frontendOrigin: values.FRONTEND_ORIGIN,
    mediaDirectory: resolve(values.MEDIA_DIRECTORY),
    workersEnabled: values.WORKERS_ENABLED === "true",
    uploadCleanup: {
      enabled: values.UPLOAD_CLEANUP_ENABLED === "true",
      hours: values.UNCLAIMED_UPLOAD_HOURS,
    },
    sessionDays: values.SESSION_DAYS,
    maxReservations: values.MAX_ACTIVE_RESERVATIONS,
    gateway: values.COMMERCE_GATEWAY_URL
      ? {
          url: values.COMMERCE_GATEWAY_URL.replace(/\/$/, ""),
          token: values.COMMERCE_GATEWAY_TOKEN!,
          webhookSecret: values.COMMERCE_WEBHOOK_SECRET!,
        }
      : undefined,
    smtp:
      values.SMTP_HOST && values.MAIL_FROM
        ? {
            host: values.SMTP_HOST,
            port: values.SMTP_PORT,
            user: values.SMTP_USER,
            password: values.SMTP_PASSWORD,
            from: values.MAIL_FROM,
          }
        : undefined,
  };
}
