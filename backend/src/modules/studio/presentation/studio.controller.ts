import { notFound } from "../../../shared/errors";
import { PartnersService } from "../../partners/application/partners.service";
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
import { StudioService } from "../application/studio.service";
import { StoresService } from "../../stores/application/stores.service";
import { SessionGuard } from "../../auth/presentation/session.guard";
import { PlatformGuard } from "../../auth/presentation/platform.guard";
import { parse, text, idSchema, moneySchema } from "../../../shared/validation";
import { pageQuery } from "../../../shared/page";
import type { AuthRequest } from "../../../shared/http";
const job = z
  .object({
    requestId: idSchema,
    productId: idSchema,
    sourceUrl: text(200).min(1),
    mode: z.enum(["model", "scene", "upscale"]),
    prompt: text(1000),
    ratio: z.enum(["1:1", "4:5", "16:9"]),
  })
  .strict();
@Controller()
@UseGuards(SessionGuard)
export class StudioController {
  constructor(
    private readonly studio: StudioService,
    private readonly stores: StoresService,
    private readonly partners: PartnersService,
  ) {}
  @Get("stores/:slug/studio") async balance(
    @Param("slug") slug: string,
    @Req() req: AuthRequest,
  ) {
    return {
      credits: await this.studio.balance(
        (await this.stores.owned(slug, req.actor!.id, "catalog-read")).id,
      ),
      policy: await this.studio.policy(),
    };
  }
  @Get("stores/:slug/studio/jobs") async list(
    @Param("slug") slug: string,
    @Req() req: AuthRequest,
    @Query() raw: unknown,
  ) {
    return this.studio.list(
      (await this.stores.owned(slug, req.actor!.id, "catalog-read")).id,
      parse(pageQuery, raw),
    );
  }
  @Post("stores/:slug/studio/jobs") async create(
    @Param("slug") slug: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    const { requestId, ...input } = parse(job, body);
    return this.studio.create(
      (await this.stores.owned(slug, req.actor!.id, "catalog-write")).id,
      req.actor!.id,
      requestId,
      input,
    );
  }
  @Get("stores/:slug/studio/jobs/:id") async get(
    @Param("slug") slug: string,
    @Param("id") id: string,
    @Req() req: AuthRequest,
  ) {
    return this.studio.get(
      (await this.stores.owned(slug, req.actor!.id, "catalog-read")).id,
      parse(idSchema, id),
    );
  }
  @Post("stores/:slug/studio/jobs/:id/cancel") async cancel(
    @Param("slug") slug: string,
    @Param("id") id: string,
    @Req() req: AuthRequest,
  ) {
    return this.studio.cancel(
      (await this.stores.owned(slug, req.actor!.id, "catalog-write")).id,
      parse(idSchema, id),
      req.actor!.id,
    );
  }
  @Post("stores/:slug/studio/jobs/:id/publish") async publish(
    @Param("slug") slug: string,
    @Param("id") id: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    const v = parse(
      z
        .object({ cover: z.boolean(), productVersion: z.number().int().min(0) })
        .strict(),
      body,
    );
    return this.studio.publish(
      (await this.stores.owned(slug, req.actor!.id, "catalog-write")).id,
      parse(idSchema, id),
      v.cover,
      v.productVersion,
    );
  }
  @Post("stores/:slug/studio/credit-purchases") async purchase(
    @Param("slug") slug: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    const v = parse(
      z
        .object({
          requestId: idSchema,
          credits: z.number().int().min(1).max(1000000),
        })
        .strict(),
      body,
    );
    return this.studio.purchase(
      (await this.stores.owned(slug, req.actor!.id)).id,
      req.actor!.id,
      v.requestId,
      v.credits,
    );
  }
  @Post("stores/:slug/studio/credit-purchases/:id/refund") async refund(
    @Param("slug") slug: string,
    @Param("id") id: string,
    @Req() req: AuthRequest,
  ) {
    return this.studio.refundPurchase(
      (await this.stores.owned(slug, req.actor!.id)).id,
      parse(idSchema, id),
      req.actor!.id,
    );
  }
  @Put("platform/studio-policy") @UseGuards(PlatformGuard) policy(
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    const cost = z.number().int().min(1).max(1000),
      v = parse(
        z
          .object({
            version: z.number().int().min(0),
            costs: z
              .object({ model: cost, scene: cost, upscale: cost })
              .strict(),
            creditPriceCents: moneySchema.min(1),
          })
          .strict(),
        body,
      );
    return this.studio.configure(
      v.version,
      v.costs,
      v.creditPriceCents,
      req.actor!.id,
    );
  }
  @Post("platform/stores/:id/studio-credits")
  @UseGuards(PlatformGuard)
  async grant(
    @Param("id") id: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    await this.stores.byId(parse(idSchema, id));
    const v = parse(
      z
        .object({
          requestId: idSchema,
          credits: z.number().int().min(1).max(1000000),
        })
        .strict(),
      body,
    );
    return this.studio.grant(id, v.requestId, v.credits, req.actor!.id);
  }
  private async supplier(id: string, req: AuthRequest) {
    const partner = await this.partners.access(
      parse(idSchema, id),
      req.actor!.id,
      req.method === "GET" ? "catalog-read" : "studio-write",
    );
    if (partner.kind !== "supplier") throw notFound();
    return partner.id;
  }
  @Get("partners/:partnerId/studio") async partnerBalance(
    @Param("partnerId") id: string,
    @Req() req: AuthRequest,
  ) {
    return {
      credits: await this.studio.balance(await this.supplier(id, req)),
      policy: await this.studio.policy(),
    };
  }
  @Get("partners/:partnerId/studio/jobs") async partnerJobs(
    @Param("partnerId") id: string,
    @Req() req: AuthRequest,
    @Query() query: unknown,
  ) {
    return this.studio.list(
      await this.supplier(id, req),
      parse(pageQuery, query),
    );
  }
  @Post("partners/:partnerId/studio/jobs") async partnerCreate(
    @Param("partnerId") id: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    const { requestId, ...input } = parse(job, body);
    return this.studio.create(
      await this.supplier(id, req),
      req.actor!.id,
      requestId,
      input,
      "supplier",
    );
  }
  @Get("partners/:partnerId/studio/jobs/:id") async partnerJob(
    @Param("partnerId") partnerId: string,
    @Param("id") id: string,
    @Req() req: AuthRequest,
  ) {
    return this.studio.get(
      await this.supplier(partnerId, req),
      parse(idSchema, id),
    );
  }
  @Post("partners/:partnerId/studio/jobs/:id/cancel") async partnerCancel(
    @Param("partnerId") partnerId: string,
    @Param("id") id: string,
    @Req() req: AuthRequest,
  ) {
    return this.studio.cancel(
      await this.supplier(partnerId, req),
      parse(idSchema, id),
      req.actor!.id,
    );
  }
  @Post("partners/:partnerId/studio/jobs/:id/publish") async partnerPublish(
    @Param("partnerId") partnerId: string,
    @Param("id") id: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    const v = parse(
      z
        .object({ cover: z.boolean(), productVersion: z.number().int().min(0) })
        .strict(),
      body,
    );
    return this.studio.publish(
      await this.supplier(partnerId, req),
      parse(idSchema, id),
      v.cover,
      v.productVersion,
      req.actor!.id,
    );
  }
  @Post("partners/:partnerId/studio/credit-purchases") async partnerPurchase(
    @Param("partnerId") id: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    const v = parse(
      z
        .object({
          requestId: idSchema,
          credits: z.number().int().min(1).max(1000000),
        })
        .strict(),
      body,
    );
    return this.studio.purchase(
      await this.supplier(id, req),
      req.actor!.id,
      v.requestId,
      v.credits,
    );
  }
  @Post("partners/:partnerId/studio/credit-purchases/:id/refund")
  async partnerRefund(
    @Param("partnerId") partnerId: string,
    @Param("id") id: string,
    @Req() req: AuthRequest,
  ) {
    return this.studio.refundPurchase(
      await this.supplier(partnerId, req),
      parse(idSchema, id),
      req.actor!.id,
    );
  }
  @Post("platform/partners/:id/studio-credits")
  @UseGuards(PlatformGuard)
  async partnerGrant(
    @Param("id") id: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    await this.partners.get(parse(idSchema, id));
    const v = parse(
      z
        .object({
          requestId: idSchema,
          credits: z.number().int().min(1).max(1000000),
        })
        .strict(),
      body,
    );
    return this.studio.grant(id, v.requestId, v.credits, req.actor!.id);
  }
}
