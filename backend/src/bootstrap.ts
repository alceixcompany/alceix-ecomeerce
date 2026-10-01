import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { json } from "express";
import type { Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { randomUUID } from "node:crypto";
import { AppModule } from "./app.module";
import type { AppConfig } from "./config/config";
import { ErrorFilter, type AuthRequest } from "./shared/http";
export async function createApp(config: AppConfig) {
  const app = await NestFactory.create(AppModule.register(config), {
    bodyParser: false,
    logger: config.environment === "test" ? false : ["error", "warn", "log"],
  });
  app.setGlobalPrefix("api/v1");
  app.use(helmet());
  app.use(cookieParser());
  app.use(json({ limit: "128kb" }));
  app.enableCors({ origin: config.frontendOrigin, credentials: true });
  const buckets = new Map<string, { count: number; reset: number }>();
  app.use((request: AuthRequest, response: Response, next: NextFunction) => {
    request.requestId = randomUUID();
    response
      .set("X-Request-Id", request.requestId)
      .set("Cache-Control", "no-store");
    if (!["GET", "HEAD", "OPTIONS"].includes(request.method)) {
      const now = Date.now(),
        sensitive = /\/(auth|applications)\//.test(request.path),
        key = `${request.ip}:${sensitive ? "sensitive" : "write"}`;
      if (buckets.size > 10000)
        for (const [id, bucket] of buckets)
          if (bucket.reset <= now) buckets.delete(id);
      const bucket = buckets.get(key);
      const active =
        !bucket || bucket.reset <= now
          ? { count: 0, reset: now + 60000 }
          : bucket;
      active.count++;
      buckets.set(key, active);
      if (active.count > (sensitive ? 30 : 200)) {
        response
          .set("Retry-After", String(Math.ceil((active.reset - now) / 1000)))
          .status(429)
          .json({
            code: "RATE_LIMITED",
            message: "Çok fazla istek gönderildi. Biraz sonra tekrar deneyin.",
            requestId: request.requestId,
          });
        return;
      }
    }
    next();
  });
  // Body-parser failures happen outside Nest's exception boundary.
  app.use(
    (
      error: unknown,
      request: Request,
      response: Response,
      next: NextFunction,
    ) => {
      if (
        error &&
        typeof error === "object" &&
        "type" in error &&
        ["entity.too.large", "entity.parse.failed"].includes(String(error.type))
      ) {
        response.status(error.type === "entity.too.large" ? 413 : 400).json({
          code: "INVALID_BODY",
          message: "İstek içeriği geçersiz veya çok büyük.",
        });
        return;
      }
      next(error);
    },
  );
  app.useGlobalFilters(new ErrorFilter());
  if (config.environment !== "production") {
    const document = SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle("Alceix API")
        .setVersion("1")
        .addCookieAuth("alceix_session")
        .build(),
    );
    SwaggerModule.setup("api/docs", app, document);
  }
  await app.init();
  return app;
}
