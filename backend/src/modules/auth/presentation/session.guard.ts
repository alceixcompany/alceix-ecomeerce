import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { AuthService } from "../application/auth.service";
import type { AuthRequest } from "../../../shared/http";
import { unauthorized } from "../../../shared/errors";
export const SESSION_COOKIE = "alceix_session";
export function sessionToken(request: AuthRequest): string | undefined {
  const cookies: unknown = request.cookies;
  if (!cookies || typeof cookies !== "object") return undefined;
  const value = (cookies as Record<string, unknown>)[SESSION_COOKIE];
  return typeof value === "string" ? value : undefined;
}
@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly auth: AuthService) {}
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<AuthRequest>();
    const actor = await this.auth.actor(sessionToken(request));
    if (!actor) throw unauthorized();
    request.actor = actor;
    return true;
  }
}
