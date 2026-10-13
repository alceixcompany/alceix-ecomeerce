import { providerEventSchema } from "../application/provider-event.schema";
import {
  PlatformGuard,
  PlatformPermission,
} from "../../auth/presentation/platform.guard";
import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Req,
  Headers,
  UseGuards,
} from "@nestjs/common";
import { createHash } from "node:crypto";
import { conflict } from "../../../shared/errors";
import { z } from "zod";
import { CommerceService } from "../application/commerce.service";
import { IntegrationsService } from "../../integrations/application/integrations.service";
import { StoresService } from "../../stores/application/stores.service";
import { SessionGuard } from "../../auth/presentation/session.guard";
import { parse, text, idSchema, ApiInput } from "../../../shared/validation";
import type { AuthRequest } from "../../../shared/http";
const request = z
    .object({
      requestId: idSchema,
      couponCode: z
        .string()
        .trim()
        .regex(/^(?:[A-Za-z0-9-]{3,32})?$/)
        .transform((value) => value.toUpperCase())
        .default(""),
    })
    .strict(),
  returnRequest = request.extend({ reason: text(1000).min(1) });
@Controller()
@UseGuards(SessionGuard)
export class CommerceController {
  constructor(
    private readonly commerce: CommerceService,
    private readonly stores: StoresService,
  ) {}
  private async merchant(slug: string, req: AuthRequest, write = false) {
    return (
      await this.stores.owned(
        slug,
        req.actor!.id,
        write ? "orders-write" : "orders-read",
      )
    ).id;
  }

  @Post("public/stores/:slug/checkout") async checkout(
    @Param("slug") slug: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    const v = parse(
      z
        .object({
          requestId: idSchema,
          cartVersion: z.number().int().min(0),
          customer: text(100).min(1),
          email: z.email().max(254).optional(),
          phone: text(30).default(""),
          city: text(120).min(1),
          address: text(400).min(1),
          customerNote: text(500).default(""),
        })
        .strict(),
      body,
    );
    const cookie = req.cookies?.alceix_cart;
    if (typeof cookie !== "string" || !/^[a-f0-9]{64}$/.test(cookie))
      throw conflict("Sepet oturumu bulunamadı.");
    const { requestId, cartVersion, ...contact } = v;
    return this.commerce.checkout(
      (await this.stores.bySlug(slug)).id,
      req.actor!.id,
      requestId,
      createHash("sha256").update(cookie).digest("hex"),
      cartVersion,
      { ...contact, email: contact.email ?? req.actor!.email, carrier: "" },
    );
  }
  @Post("stores/:slug/orders/:id/payment") @ApiInput(request) async payment(
    @Param("slug") slug: string,
    @Param("id") id: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    return this.commerce.startPayment(
      await this.merchant(slug, req, true),
      parse(idSchema, id),
      req.actor!.id,
      parse(request, body).requestId,
      false,
      parse(request, body).couponCode,
    );
  }
  @Post("public/stores/:slug/orders/:id/payment")
  @ApiInput(request)
  async buyerPayment(
    @Param("slug") slug: string,
    @Param("id") id: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    return this.commerce.startPayment(
      (await this.stores.bySlug(slug)).id,
      parse(idSchema, id),
      req.actor!.id,
      parse(request, body).requestId,
      true,
      parse(request, body).couponCode,
    );
  }
  @Get("stores/:slug/payments/:id") async readPayment(
    @Param("slug") slug: string,
    @Param("id") id: string,
    @Req() req: AuthRequest,
  ) {
    return this.commerce.paymentView(
      parse(idSchema, id),
      await this.merchant(slug, req),
    );
  }
  @Get("public/stores/:slug/orders/:id/payment") async buyerRead(
    @Param("slug") slug: string,
    @Param("id") id: string,
    @Req() req: AuthRequest,
  ) {
    return this.commerce.buyerPaymentView(
      (await this.stores.bySlug(slug)).id,
      parse(idSchema, id),
      req.actor!.id,
    );
  }
  @Post("stores/:slug/orders/:id/shipment") async shipment(
    @Param("slug") slug: string,
    @Param("id") id: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    const v = parse(request.extend({ carrier: text(80).min(1) }), body);
    return this.commerce.startShipment(
      await this.merchant(slug, req, true),
      parse(idSchema, id),
      req.actor!.id,
      v.requestId,
      v.carrier,
    );
  }
  @Get("stores/:slug/orders/:id/shipment") async readShipment(
    @Param("slug") slug: string,
    @Param("id") id: string,
    @Req() req: AuthRequest,
  ) {
    return this.commerce.shipment(
      await this.merchant(slug, req),
      parse(idSchema, id),
    );
  }
  @Post("public/stores/:slug/orders/:id/return")
  @ApiInput(returnRequest)
  async buyerReturn(
    @Param("slug") slug: string,
    @Param("id") id: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    const v = parse(returnRequest, body);
    return this.commerce.requestReturn(
      (await this.stores.bySlug(slug)).id,
      parse(idSchema, id),
      req.actor!.id,
      v.requestId,
      v.reason,
    );
  }
  @Get("public/stores/:slug/orders/:id/return") async buyerReturnRead(
    @Param("slug") slug: string,
    @Param("id") id: string,
    @Req() req: AuthRequest,
  ) {
    return this.commerce.returnView(
      (await this.stores.bySlug(slug)).id,
      parse(idSchema, id),
      req.actor!.id,
    );
  }
  @Get("stores/:slug/orders/:id/return") async returnRead(
    @Param("slug") slug: string,
    @Param("id") id: string,
    @Req() req: AuthRequest,
  ) {
    return this.commerce.returnView(
      await this.merchant(slug, req),
      parse(idSchema, id),
    );
  }
  @Post("stores/:slug/returns/:id/transition") async returnAction(
    @Param("slug") slug: string,
    @Param("id") id: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    const v = parse(
      z
        .object({
          version: z.number().int().min(0),
          action: z.enum(["approve", "reject", "receive"]),
          restock: z.boolean().default(false),
        })
        .strict(),
      body,
    );
    return this.commerce.returnAction(
      await this.merchant(slug, req, true),
      parse(idSchema, id),
      req.actor!.id,
      v.version,
      v.action,
      v.restock,
    );
  }
  @Post("stores/:slug/orders/:id/refund-unshipped") async refundUnshipped(
    @Param("slug") slug: string,
    @Param("id") id: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    const v = parse(
      z
        .object({
          requestId: idSchema,
          version: z.number().int().min(0),
          reason: text(1000).min(1),
        })
        .strict(),
      body,
    );
    return this.commerce.refundUnshipped(
      await this.merchant(slug, req, true),
      parse(idSchema, id),
      req.actor!.id,
      v.requestId,
      v.version,
      v.reason,
    );
  }
}
@Controller("integrations/events")
export class IntegrationEventsController {
  constructor(
    private readonly integrations: IntegrationsService,
    private readonly commerce: CommerceService,
  ) {}
  @Post() @ApiInput(providerEventSchema) receive(
    @Req() req: AuthRequest,
    @Headers("x-alceix-timestamp") timestamp: string | undefined,
    @Headers("x-alceix-signature") signature: string | undefined,
    @Body() body: unknown,
  ) {
    this.integrations.verify(req.rawBody, timestamp, signature);
    return this.commerce.event(parse(providerEventSchema, body), body);
  }
}

@Controller("platform/stores/:storeId")
@UseGuards(SessionGuard, PlatformGuard)
@PlatformPermission("finance")
export class PlatformCommerceController {
  constructor(
    private readonly commerce: CommerceService,
    private readonly stores: StoresService,
  ) {}
  @Get("orders/:id/return") async read(
    @Param("storeId") storeId: string,
    @Param("id") id: string,
  ) {
    await this.stores.byId(parse(idSchema, storeId));
    return this.commerce.returnView(storeId, parse(idSchema, id));
  }
  @Post("orders/:id/refund-unshipped") async refund(
    @Param("storeId") storeId: string,
    @Param("id") id: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    await this.stores.byId(parse(idSchema, storeId));
    const v = parse(
      z
        .object({
          requestId: idSchema,
          version: z.number().int().min(0),
          reason: text(1000).min(1),
        })
        .strict(),
      body,
    );
    return this.commerce.refundUnshipped(
      storeId,
      parse(idSchema, id),
      req.actor!.id,
      v.requestId,
      v.version,
      v.reason,
    );
  }
  @Post("returns/:id/transition") async transition(
    @Param("storeId") storeId: string,
    @Param("id") id: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    await this.stores.byId(parse(idSchema, storeId));
    const v = parse(
      z
        .object({
          version: z.number().int().min(0),
          action: z.enum(["approve", "reject", "receive"]),
          restock: z.boolean().default(false),
        })
        .strict(),
      body,
    );
    return this.commerce.returnAction(
      storeId,
      parse(idSchema, id),
      req.actor!.id,
      v.version,
      v.action,
      v.restock,
    );
  }
}

@Controller("platform/integration-jobs")
@UseGuards(SessionGuard, PlatformGuard)
@PlatformPermission("finance")
export class PlatformReconciliationController {
  constructor(private readonly commerce: CommerceService) {}
  @Post(":id/reconcile") reconcile(@Param("id") id: string) {
    return this.commerce.reconcileProviderResult(parse(idSchema, id));
  }
}
