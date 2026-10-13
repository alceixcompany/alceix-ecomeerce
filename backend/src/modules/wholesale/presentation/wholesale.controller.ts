import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  Req,
  UseGuards,
} from "@nestjs/common";
import { z } from "zod";
import { WholesaleService } from "../application/wholesale.service";
import { StoresService } from "../../stores/application/stores.service";
import { PartnersService } from "../../partners/application/partners.service";
import { SessionGuard } from "../../auth/presentation/session.guard";
import { parse, text, idSchema, moneySchema } from "../../../shared/validation";
import { pageQuery } from "../../../shared/page";
import type { AuthRequest } from "../../../shared/http";
@Controller()
@UseGuards(SessionGuard)
export class WholesaleController {
  constructor(
    private readonly wholesale: WholesaleService,
    private readonly stores: StoresService,
    private readonly partners: PartnersService,
  ) {}
  @Get("stores/:slug/wholesale-orders") async merchantList(
    @Param("slug") slug: string,
    @Req() req: AuthRequest,
    @Query() raw: unknown,
  ) {
    return this.wholesale.list(
      {
        storeId: (await this.stores.owned(slug, req.actor!.id, "orders-read"))
          .id,
      },
      parse(pageQuery, raw),
    );
  }
  @Post("stores/:slug/wholesale-orders") async create(
    @Param("slug") slug: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    const v = parse(
      z
        .object({
          requestId: idSchema,
          partnerId: idSchema,
          productId: idSchema,
          maxTotalCents: moneySchema.min(1),
          quantity: z.number().int().min(1).max(9999),
          customer: text(100).min(1),
          address: text(400).min(1),
          city: text(120).min(1),
          phone: text(30),
        })
        .strict(),
      body,
    );
    return this.wholesale.create(
      (await this.stores.owned(slug, req.actor!.id)).id,
      req.actor!.id,
      v.requestId,
      v.partnerId,
      v.productId,
      v.quantity,
      v.maxTotalCents,
      {
        customer: v.customer,
        address: v.address,
        city: v.city,
        phone: v.phone,
      },
    );
  }
  @Post("stores/:slug/wholesale-orders/:id/cancel") async cancel(
    @Param("slug") slug: string,
    @Param("id") id: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    return this.wholesale.cancel(
      parse(idSchema, id),
      { storeId: (await this.stores.owned(slug, req.actor!.id)).id },
      req.actor!.id,
      parse(z.object({ version: z.number().int().min(0) }).strict(), body)
        .version,
    );
  }
  @Get("partners/:id/wholesale-orders") async supplierList(
    @Param("id") id: string,
    @Req() req: AuthRequest,
    @Query() raw: unknown,
  ) {
    await this.partners.access(
      parse(idSchema, id),
      req.actor!.id,
      "orders-read",
    );
    return this.wholesale.list({ partnerId: id }, parse(pageQuery, raw));
  }
  @Post("partners/:partnerId/wholesale-orders/:id/shipment") async ship(
    @Param("partnerId") partnerId: string,
    @Param("id") id: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    await this.partners.access(
      parse(idSchema, partnerId),
      req.actor!.id,
      "orders-write",
    );
    const v = parse(
      z.object({ requestId: idSchema, carrier: text(80).min(1) }).strict(),
      body,
    );
    return this.wholesale.ship(
      parse(idSchema, id),
      partnerId,
      req.actor!.id,
      v.requestId,
      v.carrier,
    );
  }
  @Post("stores/:slug/supply-imports") async import(
    @Param("slug") slug: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    const v = parse(
      z
        .object({
          requestId: idSchema,
          partnerId: idSchema,
          productId: idSchema,
          priceCents: moneySchema.min(1),
        })
        .strict(),
      body,
    );
    return this.wholesale.import(
      (await this.stores.owned(slug, req.actor!.id, "catalog-write")).id,
      req.actor!.id,
      v.requestId,
      v.partnerId,
      v.productId,
      v.priceCents,
    );
  }
  @Get("stores/:slug/wholesale-orders/:id") async merchantOrder(
    @Param("slug") slug: string,
    @Param("id") id: string,
    @Req() req: AuthRequest,
  ) {
    return this.wholesale.get(parse(idSchema, id), {
      storeId: (await this.stores.owned(slug, req.actor!.id, "orders-read")).id,
    });
  }
  @Get("partners/:partnerId/wholesale-orders/:id") async supplierOrder(
    @Param("partnerId") partnerId: string,
    @Param("id") id: string,
    @Req() req: AuthRequest,
  ) {
    await this.partners.access(
      parse(idSchema, partnerId),
      req.actor!.id,
      req.method === "GET" ? "orders-read" : "orders-write",
    );
    return this.wholesale.get(parse(idSchema, id), { partnerId });
  }
  @Post("partners/:partnerId/wholesale-orders/:id/cancel") async supplierCancel(
    @Param("partnerId") partnerId: string,
    @Param("id") id: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    await this.partners.access(
      parse(idSchema, partnerId),
      req.actor!.id,
      "orders-write",
    );
    return this.wholesale.cancel(
      parse(idSchema, id),
      { partnerId },
      req.actor!.id,
      parse(z.object({ version: z.number().int().min(0) }).strict(), body)
        .version,
    );
  }
}
