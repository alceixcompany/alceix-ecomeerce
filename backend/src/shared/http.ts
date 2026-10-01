import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
} from "@nestjs/common";
import type { Request, Response } from "express";
import { randomUUID } from "node:crypto";
import { AppError } from "./errors";
import { CONFIG, type AppConfig } from "../config/config";
export type Actor = { id: string; name: string; email: string };
export type AuthRequest = Request & { actor?: Actor; requestId?: string };
@Catch()
export class ErrorFilter implements ExceptionFilter {
  catch(error: unknown, host: ArgumentsHost) {
    const request = host.switchToHttp().getRequest<AuthRequest>();
    const response = host.switchToHttp().getResponse<Response>();
    let status = 500,
      code = "INTERNAL_ERROR",
      message = "İşlem tamamlanamadı. Lütfen tekrar deneyin.";
    let fields: Record<string, string[]> | undefined;
    if (error instanceof AppError) ({ status, code, message, fields } = error);
    else if (error instanceof HttpException) {
      status = error.getStatus();
      code = status === 429 ? "RATE_LIMITED" : "REQUEST_ERROR";
      message =
        status === 429
          ? "Çok fazla istek gönderildi. Biraz sonra tekrar deneyin."
          : "İstek işlenemedi.";
    } else if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      status = 409;
      code = "DUPLICATE_RECORD";
      message = "E-posta, mağaza adresi, kategori veya SKU zaten kullanılıyor.";
    }
    if (status === 500)
      console.error(
        JSON.stringify({
          event: "request_failed",
          requestId: request.requestId,
          errorType: error instanceof Error ? error.name : "Unknown",
        }),
      );
    response.status(status).json({
      code,
      message,
      fields,
      requestId: request.requestId ?? randomUUID(),
    });
  }
}
@Injectable()
export class OriginGuard implements CanActivate {
  constructor(@Inject(CONFIG) private readonly config: AppConfig) {}
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    if (
      !["GET", "HEAD", "OPTIONS"].includes(request.method) &&
      request.get("origin") !== this.config.frontendOrigin
    )
      throw new AppError(
        403,
        "INVALID_ORIGIN",
        "İsteğin kaynağı doğrulanamadı.",
      );
    return true;
  }
}
