import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  Req,
  Res,
  Body,
  UseGuards,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { createHash, randomBytes } from "node:crypto";
import { z } from "zod";
import type { Response } from "express";
import { EngagementService } from "../application/engagement.service";
import { StoresService } from "../../stores/application/stores.service";
import { AuthService } from "../../auth/application/auth.service";
import {
  SessionGuard,
  sessionToken,
} from "../../auth/presentation/session.guard";
import type { AuthRequest } from "../../../shared/http";
import { ApiInput, parse, idSchema } from "../../../shared/validation";
import { Inject } from "@nestjs/common";
import { CONFIG, type AppConfig } from "../../../config/config";
const cartSchema = z
  .object({
    version: z.number().int().min(0),
    lines: z
      .array(
        z
          .object({
            productId: idSchema,
            quantity: z.number().int().min(1).max(99),
          })
          .strict(),
      )
      .max(100)
      .refine(
        (lines) =>
          new Set(lines.map((line) => line.productId)).size === lines.length,
      ),
  })
  .strict();
@ApiTags("engagement")
@Controller("public/stores/:slug")
export class EngagementController {
  constructor(
    private readonly engagement: EngagementService,
    private readonly stores: StoresService,
    private readonly auth: AuthService,
    @Inject(CONFIG) private readonly config: AppConfig,
  ) {}
  private cartKey(request: AuthRequest, response: Response) {
    const cookies = request.cookies as Record<string, unknown> | undefined;
    const existing = cookies?.alceix_cart,
      token =
        typeof existing === "string" && /^[a-f0-9]{64}$/.test(existing)
          ? existing
          : randomBytes(32).toString("hex");
    response.cookie("alceix_cart", token, {
      httpOnly: true,
      secure: this.config.environment === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 86400000,
    });
    return createHash("sha256").update(token).digest("hex");
  }
  @Get("cart") async cart(
    @Param("slug") slug: string,
    @Req() request: AuthRequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.engagement.cart(
      this.cartKey(request, response),
      (await this.stores.publicBySlug(slug)).id,
    );
  }
  @Put("cart") @ApiInput(cartSchema) async saveCart(
    @Param("slug") slug: string,
    @Req() request: AuthRequest,
    @Res({ passthrough: true }) response: Response,
    @Body() body: unknown,
  ) {
    const input = parse(cartSchema, body);
    return this.engagement.saveCart(
      this.cartKey(request, response),
      (await this.stores.publicBySlug(slug)).id,
      input.lines,
      input.version,
    );
  }
  @Get("follow") async followed(
    @Param("slug") slug: string,
    @Req() request: AuthRequest,
  ) {
    const store = await this.stores.publicBySlug(slug),
      actor = await this.auth.actor(sessionToken(request));
    return {
      followed: actor
        ? await this.engagement.followed(store.id, actor.id)
        : false,
    };
  }
  @Put("follow") @UseGuards(SessionGuard) async follow(
    @Param("slug") slug: string,
    @Req() request: AuthRequest,
  ) {
    await this.engagement.follow(
      (await this.stores.publicBySlug(slug)).id,
      request.actor!.id,
      true,
    );
    return { followed: true };
  }
  @Delete("follow") @UseGuards(SessionGuard) async unfollow(
    @Param("slug") slug: string,
    @Req() request: AuthRequest,
  ) {
    await this.engagement.follow(
      (await this.stores.publicBySlug(slug)).id,
      request.actor!.id,
      false,
    );
    return { followed: false };
  }
}
