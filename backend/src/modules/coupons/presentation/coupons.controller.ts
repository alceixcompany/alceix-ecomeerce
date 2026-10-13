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
import { CouponsService } from "../application/coupons.service";
import { StoresService } from "../../stores/application/stores.service";
import { SessionGuard } from "../../auth/presentation/session.guard";
import { conflict } from "../../../shared/errors";
import { parse, idSchema, moneySchema } from "../../../shared/validation";
import { pageQuery } from "../../../shared/page";
import type { AuthRequest } from "../../../shared/http";
const input = z
  .object({
    code: z
      .string()
      .trim()
      .regex(/^[A-Za-z0-9-]{3,32}$/)
      .transform((value) => value.toUpperCase()),
    kind: z.enum(["fixed", "percent"]),
    amount: z.number().int().min(1).max(9999999999),
    minimumCents: moneySchema,
    limitUses: z.number().int().min(1).max(1000000),
    expiresAt: z.iso.datetime().transform((value) => new Date(value)),
    active: z.boolean(),
    reusableAfterRefund: z.boolean(),
  })
  .strict();
@Controller("stores/:slug/coupons")
@UseGuards(SessionGuard)
export class CouponsController {
  constructor(
    private readonly coupons: CouponsService,
    private readonly stores: StoresService,
  ) {}
  @Get() async list(
    @Param("slug") slug: string,
    @Req() req: AuthRequest,
    @Query() raw: unknown,
  ) {
    return this.coupons.list(
      (await this.stores.owned(slug, req.actor!.id, "read")).id,
      parse(pageQuery, raw),
    );
  }
  @Post() async create(
    @Param("slug") slug: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    const parsed = parse(input, body);
    if (parsed.kind === "percent" && parsed.amount > 99)
      throw conflict("Yüzde kuponu 1–99 aralığında olmalı.");
    return this.coupons.save(
      (await this.stores.owned(slug, req.actor!.id, "settings-write")).id,
      parsed,
    );
  }
  @Put(":id") async update(
    @Param("slug") slug: string,
    @Param("id") id: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    const { version, ...parsed } = parse(
      input.extend({ version: z.number().int().min(0) }),
      body,
    );
    if (parsed.kind === "percent" && parsed.amount > 99)
      throw conflict("Yüzde kuponu 1–99 aralığında olmalı.");
    return this.coupons.save(
      (await this.stores.owned(slug, req.actor!.id, "settings-write")).id,
      parsed,
      parse(idSchema, id),
      version,
    );
  }
}
