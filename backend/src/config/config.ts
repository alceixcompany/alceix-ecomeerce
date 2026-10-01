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
  SESSION_DAYS: z.coerce.number().int().min(1).max(30).default(7),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  MAIL_FROM: z.email().optional(),
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
  return {
    environment: values.NODE_ENV,
    port: values.PORT,
    mongoUri: values.MONGODB_URI,
    frontendOrigin: values.FRONTEND_ORIGIN,
    mediaDirectory: resolve(values.MEDIA_DIRECTORY),
    sessionDays: values.SESSION_DAYS,
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
