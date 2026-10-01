import { Body, Controller, Post, Get, Req, Res, Inject } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import type { Response } from "express";
import { z } from "zod";
import { AuthService } from "../application/auth.service";
import { SESSION_COOKIE, sessionToken } from "./session.guard";
import { CONFIG, type AppConfig } from "../../../config/config";
import type { AuthRequest } from "../../../shared/http";
import { ApiInput, parse, text } from "../../../shared/validation";
const email = z.email().max(254),
  password = z.string().min(8).max(128);
const register = z
  .object({ name: text(100).min(2), store: text(60).min(2), email, password })
  .strict();
const login = z
  .object({ email, password: z.string().min(1).max(128) })
  .strict();
const forgot = z.object({ email }).strict();
const reset = z
  .object({ token: z.string().regex(/^[a-f0-9]{64}$/), password })
  .strict();
@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    @Inject(CONFIG) private readonly config: AppConfig,
  ) {}
  private cookie(
    response: Response,
    session: { token: string; expiresAt: Date },
  ) {
    response.cookie(SESSION_COOKIE, session.token, {
      httpOnly: true,
      secure: this.config.environment === "production",
      sameSite: "lax",
      path: "/",
      expires: session.expiresAt,
    });
  }
  @Post("register")
  @ApiInput(register)
  async register(
    @Body() body: unknown,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.auth.register(parse(register, body));
    this.cookie(response, result);
    return { user: result.user, stores: result.stores };
  }
  @Post("login")
  @ApiInput(login)
  async login(
    @Body() body: unknown,
    @Res({ passthrough: true }) response: Response,
  ) {
    const input = parse(login, body),
      result = await this.auth.login(input.email, input.password);
    this.cookie(response, result);
    return { user: result.user, stores: result.stores };
  }
  @Get("me") me(@Req() request: AuthRequest) {
    return this.auth.me(sessionToken(request));
  }
  @Post("logout") async logout(
    @Req() request: AuthRequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.auth.logout(sessionToken(request));
    response.clearCookie(SESSION_COOKIE, {
      path: "/",
      httpOnly: true,
      secure: this.config.environment === "production",
      sameSite: "lax",
    });
    return { message: "Oturum kapatıldı." };
  }
  @Post("forgot-password") @ApiInput(forgot) forgot(@Body() body: unknown) {
    return this.auth.forgot(parse(forgot, body).email);
  }
  @Post("reset-password") @ApiInput(reset) reset(@Body() body: unknown) {
    const input = parse(reset, body);
    return this.auth.reset(input.token, input.password);
  }
}
