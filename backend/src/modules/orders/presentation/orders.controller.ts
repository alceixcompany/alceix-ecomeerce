import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { z } from "zod";
import { ApiTags } from "@nestjs/swagger";
import { SessionGuard } from "../../auth/presentation/session.guard";
import { StoresService } from "../../stores/application/stores.service";
import { OrdersService } from "../application/orders.service";
import { orderView, buyerOrderView } from "../domain/order";
import { ApiInput, parse, text, idSchema } from "../../../shared/validation";
import type { AuthRequest } from "../../../shared/http";
const input = z
  .object({
    requestId: idSchema,
    customer: text(100).min(1),
    email: z.union([z.literal(""), z.email().max(254)]).default(""),
    phone: text(30).default(""),
    address: text(400).min(1),
    city: text(120).min(1),
    customerNote: text(500).default(""),
    carrier: text(80).default(""),
    lines: z
      .array(
        z
          .object({
            productId: idSchema,
            quantity: z.number().int().min(1).max(99),
            variant: text(40).default(""),
          })
          .strict(),
      )
      .min(1)
      .max(30),
  })
  .strict()
  .refine(
    (v) =>
      new Set(v.lines.map((l) => `${l.productId}:${l.variant}`)).size ===
      v.lines.length,
  );
const version = z.number().int().min(0);
const edit = z
  .object({
    version,
    address: text(400).min(1),
    city: text(120).min(1),
    internalNote: text(500),
  })
  .strict();
const cancel = z.object({ version }).strict();
const query = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(5),
    q: text(150).default(""),
    tab: z
      .enum([
        "all",
        "preparing",
        "cancelled",
        "shipped",
        "delivered",
        "requests",
      ])
      .default("all"),
    carrier: text(80).default("all"),
    period: z.enum(["all", "7", "30"]).default("all"),
  })
  .strict();
@ApiTags("orders")
@UseGuards(SessionGuard)
@Controller("stores/:slug/orders")
export class OrdersController {
  constructor(
    private readonly orders: OrdersService,
    private readonly stores: StoresService,
  ) {}
  private async scope(slug: string, req: AuthRequest) {
    return (
      await this.stores.owned(
        slug,
        req.actor!.id,
        req.method === "GET" ? "orders-read" : "orders-write",
      )
    ).id;
  }
  @Get("sales/daily") async daily(
    @Param("slug") slug: string,
    @Req() req: AuthRequest,
    @Query() raw: unknown,
  ) {
    const query = parse(
      z
        .object({ days: z.coerce.number().int().min(1).max(90).default(30) })
        .strict(),
      raw,
    );
    return this.orders.dailySales(
      (await this.stores.owned(slug, req.actor!.id, "orders-read")).id,
      query.days,
    );
  }
  @Get() async list(
    @Param("slug") slug: string,
    @Req() req: AuthRequest,
    @Query() raw: unknown,
  ) {
    return this.orders.list(await this.scope(slug, req), parse(query, raw));
  }
  @Get(":id") async get(
    @Param("slug") slug: string,
    @Param("id") id: string,
    @Req() req: AuthRequest,
  ) {
    return orderView(
      await this.orders.get(await this.scope(slug, req), parse(idSchema, id)),
    );
  }
  @Post() @ApiInput(input) async create(
    @Param("slug") slug: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    const { requestId, ...values } = parse(input, body);
    return this.orders.create(
      await this.scope(slug, req),
      req.actor!.id,
      requestId,
      values,
    );
  }
  @Put(":id") @ApiInput(edit) async edit(
    @Param("slug") slug: string,
    @Param("id") id: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    const { version, ...values } = parse(edit, body);
    return this.orders.edit(
      await this.scope(slug, req),
      parse(idSchema, id),
      version,
      values,
    );
  }
  @Post(":id/cancel") @ApiInput(cancel) async cancel(
    @Param("slug") slug: string,
    @Param("id") id: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    return this.orders.cancel(
      await this.scope(slug, req),
      parse(idSchema, id),
      parse(cancel, body).version,
      "merchant",
    );
  }
}
@ApiTags("buyer-orders")
@UseGuards(SessionGuard)
@Controller("public/stores/:slug/orders")
export class BuyerOrdersController {
  constructor(
    private readonly orders: OrdersService,
    private readonly stores: StoresService,
  ) {}
  @Post() @ApiInput(input) async create(
    @Param("slug") slug: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    const { requestId, ...values } = parse(input, body);
    return this.orders.create(
      (await this.stores.publicBySlug(slug)).id,
      req.actor!.id,
      requestId,
      values,
      true,
    );
  }
  @Get() async list(
    @Param("slug") slug: string,
    @Req() req: AuthRequest,
    @Query() raw: unknown,
  ) {
    return this.orders.list(
      (await this.stores.bySlug(slug)).id,
      parse(query, raw),
      req.actor!.id,
    );
  }
  @Get(":id") async get(
    @Param("slug") slug: string,
    @Param("id") id: string,
    @Req() req: AuthRequest,
  ) {
    return buyerOrderView(
      await this.orders.get(
        (await this.stores.bySlug(slug)).id,
        parse(idSchema, id),
        req.actor!.id,
      ),
    );
  }
  @Post(":id/cancel") @ApiInput(cancel) async cancel(
    @Param("slug") slug: string,
    @Param("id") id: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    return this.orders.cancel(
      (await this.stores.bySlug(slug)).id,
      parse(idSchema, id),
      parse(cancel, body).version,
      "buyer",
      req.actor!.id,
    );
  }
}
