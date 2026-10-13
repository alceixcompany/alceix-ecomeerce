import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Query,
  Body,
  Req,
  UseGuards,
} from "@nestjs/common";
import { z } from "zod";
import { ReviewsService } from "../application/reviews.service";
import { StoresService } from "../../stores/application/stores.service";
import { PartnersService } from "../../partners/application/partners.service";
import { SessionGuard } from "../../auth/presentation/session.guard";
import {
  PlatformGuard,
  PlatformPermission,
} from "../../auth/presentation/platform.guard";
import { parse, text, idSchema } from "../../../shared/validation";
import { pageQuery } from "../../../shared/page";
import type { AuthRequest } from "../../../shared/http";
const review = z
    .object({ rating: z.number().int().min(1).max(5), text: text(2000).min(1) })
    .strict(),
  versionSchema = z.number().int().min(0);
@Controller()
export class ReviewsController {
  constructor(
    private readonly reviews: ReviewsService,
    private readonly stores: StoresService,
    private readonly partners: PartnersService,
  ) {}
  @Get("public/stores/:slug/reviews") async publicStore(
    @Param("slug") slug: string,
    @Query() raw: unknown,
  ) {
    return this.reviews.list(
      (await this.stores.publicBySlug(slug)).id,
      parse(pageQuery, raw),
      true,
    );
  }
  @Get("public/partners/:slug/reviews") async publicPartner(
    @Param("slug") slug: string,
    @Query() raw: unknown,
  ) {
    return this.reviews.list(
      (await this.partners.public(slug)).id,
      parse(pageQuery, raw),
      true,
    );
  }
  @Post("public/stores/:slug/orders/:id/review")
  @UseGuards(SessionGuard)
  async orderReview(
    @Param("slug") slug: string,
    @Param("id") id: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    const v = parse(review, body);
    return this.reviews.submit(
      req.actor!.id,
      "order",
      parse(idSchema, id),
      v.rating,
      v.text,
      (await this.stores.publicBySlug(slug)).id,
    );
  }
  @Post("offers/:id/review") @UseGuards(SessionGuard) offerReview(
    @Param("id") id: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    const v = parse(review, body);
    return this.reviews.submit(
      req.actor!.id,
      "offer",
      parse(idSchema, id),
      v.rating,
      v.text,
    );
  }
  @Put("account/reviews/:id") @UseGuards(SessionGuard) edit(
    @Param("id") id: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    const { version, ...v } = parse(
      review.extend({ version: versionSchema }),
      body,
    );
    return this.reviews.edit(
      parse(idSchema, id),
      req.actor!.id,
      version,
      v.rating,
      v.text,
    );
  }
  @Post("reviews/:id/reply") @UseGuards(SessionGuard) reply(
    @Param("id") id: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    const v = parse(
      z.object({ version: versionSchema, text: text(2000).min(1) }).strict(),
      body,
    );
    return this.reviews.reply(
      parse(idSchema, id),
      req.actor!.id,
      v.version,
      v.text,
    );
  }
  @Put("platform/reviews/:id/status")
  @PlatformPermission("reviews")
  @UseGuards(SessionGuard, PlatformGuard)
  moderate(
    @Param("id") id: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    const v = parse(
      z
        .object({
          version: versionSchema,
          status: z.enum(["approved", "rejected"]),
          reason: text(1000).min(1),
        })
        .strict(),
      body,
    );
    return this.reviews.moderate(
      parse(idSchema, id),
      req.actor!.id,
      v.version,
      v.status,
      v.reason,
    );
  }
  @Get("stores/:slug/reviews") @UseGuards(SessionGuard) async privateStore(
    @Param("slug") slug: string,
    @Req() req: AuthRequest,
    @Query() raw: unknown,
  ) {
    return this.reviews.list(
      (await this.stores.owned(slug, req.actor!.id, "read")).id,
      parse(pageQuery, raw),
      false,
    );
  }
  @Get("partners/:id/reviews") @UseGuards(SessionGuard) async privatePartner(
    @Param("id") id: string,
    @Req() req: AuthRequest,
    @Query() raw: unknown,
  ) {
    return this.reviews.list(
      (await this.partners.owner(parse(idSchema, id), req.actor!.id)).id,
      parse(pageQuery, raw),
      false,
    );
  }
  @Get("platform/reviews")
  @UseGuards(SessionGuard, PlatformGuard)
  @PlatformPermission("reviews")
  platformList(@Query() query: unknown) {
    return this.reviews.platform(parse(pageQuery, query));
  }
}
