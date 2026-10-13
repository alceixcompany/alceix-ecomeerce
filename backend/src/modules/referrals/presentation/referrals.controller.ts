import {
  Controller,
  Get,
  Post,
  Put,
  Req,
  Query,
  Param,
  Body,
  UseGuards,
} from "@nestjs/common";
import { z } from "zod";
import { ReferralsService } from "../application/referrals.service";
import { SessionGuard } from "../../auth/presentation/session.guard";
import {
  PlatformGuard,
  PlatformPermission,
} from "../../auth/presentation/platform.guard";
import { parse, text, idSchema, ApiInput } from "../../../shared/validation";
import { pageQuery } from "../../../shared/page";
import type { AuthRequest } from "../../../shared/http";
const input = z
  .object({
    ownerId: idSchema,
    code: z
      .string()
      .trim()
      .regex(/^[A-Z0-9-]{3,32}$/),
    title: text(150).min(1),
    kind: z.enum(["referral", "campaign"]),
    rewardBps: z.number().int().min(0).max(10000),
    discountBps: z.number().int().min(0).max(5000),
    discountStoreId: z.union([z.literal(""), idSchema]),
    discountUses: z.number().int().min(0).max(1000000),
    startsOn: z.iso.date(),
    endsOn: z.iso.date(),
    active: z.boolean(),
    qualification: z.literal("merchant-first-settled-sale"),
  })
  .strict()
  .refine(
    (v) =>
      v.endsOn >= v.startsOn &&
      (!v.discountBps || (!!v.discountStoreId && v.discountUses > 0)) &&
      (v.kind !== "campaign" || v.rewardBps === 0),
  );
@Controller()
export class ReferralsController {
  constructor(private readonly referrals: ReferralsService) {}
  @Get("public/referral-codes/:code") resolve(@Param("code") code: string) {
    return this.referrals.resolve(
      parse(z.string().regex(/^[A-Z0-9-]{3,32}$/), code),
    );
  }
  @Get("account/referral-codes") @UseGuards(SessionGuard) own(
    @Req() req: AuthRequest,
    @Query() query: unknown,
  ) {
    return this.referrals.codes(parse(pageQuery, query), req.actor!.id);
  }
  @Get("account/referral-conversions") @UseGuards(SessionGuard) ownConversions(
    @Req() req: AuthRequest,
    @Query() query: unknown,
  ) {
    return this.referrals.conversions(parse(pageQuery, query), req.actor!.id);
  }
  @Get("platform/referral-codes")
  @UseGuards(SessionGuard, PlatformGuard)
  @PlatformPermission("referrals")
  codes(@Query() query: unknown) {
    return this.referrals.codes(parse(pageQuery, query));
  }
  @Get("platform/referral-conversions")
  @UseGuards(SessionGuard, PlatformGuard)
  @PlatformPermission("referrals")
  conversions(@Query() query: unknown) {
    return this.referrals.conversions(parse(pageQuery, query));
  }
  @Post("platform/referral-codes")
  @UseGuards(SessionGuard, PlatformGuard)
  @PlatformPermission("referrals")
  @ApiInput(input.safeExtend({ requestId: idSchema }))
  create(@Req() req: AuthRequest, @Body() body: unknown) {
    const { requestId, ...v } = parse(
      input.safeExtend({ requestId: idSchema }),
      body,
    );
    return this.referrals.create(requestId, req.actor!.id, v);
  }
  @Put("platform/referral-codes/:id")
  @UseGuards(SessionGuard, PlatformGuard)
  @PlatformPermission("referrals")
  @ApiInput(input.safeExtend({ version: z.number().int().min(0) }))
  update(
    @Param("id") id: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    const { version, ...v } = parse(
      input.safeExtend({ version: z.number().int().min(0) }),
      body,
    );
    return this.referrals.update(
      parse(idSchema, id),
      req.actor!.id,
      version,
      v,
    );
  }
}
