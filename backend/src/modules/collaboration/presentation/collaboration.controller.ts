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
import { CollaborationService } from "../application/collaboration.service";
import { StoresService } from "../../stores/application/stores.service";
import { PartnersService } from "../../partners/application/partners.service";
import { SessionGuard } from "../../auth/presentation/session.guard";
import {
  PlatformGuard,
  PlatformPermission,
} from "../../auth/presentation/platform.guard";
import { AuditService } from "../../audit/application/audit.service";
import {
  parse,
  text,
  idSchema,
  moneySchema,
  ApiInput,
} from "../../../shared/validation";
import { pageQuery } from "../../../shared/page";
import type { AuthRequest } from "../../../shared/http";
const versionSchema = z.number().int().min(0);
const request = z.object({ partnerId: idSchema }).strict(),
  message = z.object({ messageId: idSchema, text: text(4000).min(1) }).strict();
const offer = z
  .object({
    requestId: idSchema,
    title: text(150).min(1),
    brief: text(2000).min(1),
    deliverables: text(1000).min(1),
    deadline: z.iso.date(),
    kind: z.enum(["paid", "gift"]),
    feeCents: moneySchema,
  })
  .strict();
const action = z
  .object({
    version: versionSchema,
    action: z.enum([
      "accept",
      "reject",
      "withdraw",
      "submit",
      "complete",
      "revision",
    ]),
    contentUrl: z
      .union([z.literal(""), z.url().startsWith("https://").max(500)])
      .default(""),
    report: text(2000).default(""),
  })
  .strict();
const campaign = z
  .object({
    title: text(150).min(1),
    brief: text(2000).min(1),
    format: text(80).min(1),
    budgetCents: moneySchema,
    deadline: z.iso.date(),
    slots: z.number().int().min(1).max(1000),
  })
  .strict();
@Controller()
@UseGuards(SessionGuard)
export class CollaborationController {
  constructor(
    private readonly collaboration: CollaborationService,
    private readonly stores: StoresService,
    private readonly partners: PartnersService,
    private readonly audit: AuditService,
  ) {}
  private scope(slug: string, req: AuthRequest, write = false) {
    return this.stores.owned(
      slug,
      req.actor!.id,
      write ? "collaboration-write" : "collaboration-read",
    );
  }
  @Get("stores/:slug/partners") async links(
    @Param("slug") slug: string,
    @Req() req: AuthRequest,
    @Query() raw: unknown,
  ) {
    return this.collaboration.links(
      { storeId: (await this.scope(slug, req)).id },
      parse(pageQuery, raw),
    );
  }
  @Post("stores/:slug/partners") @ApiInput(request) async createLink(
    @Param("slug") slug: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    return this.collaboration.request(
      (await this.scope(slug, req, true)).id,
      parse(request, body).partnerId,
      req.actor!.id,
      "store",
    );
  }
  @Get("partners/:id/stores") async partnerLinks(
    @Param("id") id: string,
    @Req() req: AuthRequest,
    @Query() raw: unknown,
  ) {
    await this.partners.access(
      parse(idSchema, id),
      req.actor!.id,
      "collaboration-read",
    );
    return this.collaboration.links({ partnerId: id }, parse(pageQuery, raw));
  }
  @Post("partners/:id/stores") async partnerRequest(
    @Param("id") id: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    const v = parse(z.object({ storeId: idSchema }).strict(), body);
    return this.collaboration.request(
      v.storeId,
      parse(idSchema, id),
      req.actor!.id,
      "partner",
    );
  }
  @Post("links/:id/transition") async transition(
    @Param("id") id: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    const v = parse(
      z
        .object({
          version: versionSchema,
          action: z.enum(["accept", "reject", "close", "reopen"]),
        })
        .strict(),
      body,
    );
    return this.collaboration.transition(
      parse(idSchema, id),
      req.actor!.id,
      v.version,
      v.action,
    );
  }
  @Get("links/:id/messages") messages(
    @Param("id") id: string,
    @Req() req: AuthRequest,
    @Query() raw: unknown,
  ) {
    return this.collaboration.messages(
      parse(idSchema, id),
      req.actor!.id,
      parse(pageQuery, raw),
    );
  }
  @Post("links/:id/messages") @ApiInput(message) message(
    @Param("id") id: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    const v = parse(message, body);
    return this.collaboration.message(
      parse(idSchema, id),
      req.actor!.id,
      v.messageId,
      v.text,
    );
  }
  @Get("links/:id/offers") offers(
    @Param("id") id: string,
    @Req() req: AuthRequest,
    @Query() raw: unknown,
  ) {
    return this.collaboration.offers(
      parse(idSchema, id),
      req.actor!.id,
      parse(pageQuery, raw),
    );
  }
  @Post("links/:id/offers") @ApiInput(offer) offer(
    @Param("id") id: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    const { requestId, ...terms } = parse(offer, body);
    return this.collaboration.offer(
      parse(idSchema, id),
      req.actor!.id,
      requestId,
      terms,
    );
  }
  @Post("offers/:id/transition") @ApiInput(action) offerAction(
    @Param("id") id: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    const v = parse(action, body);
    return this.collaboration.offerAction(
      parse(idSchema, id),
      req.actor!.id,
      v.version,
      v.action,
      v.contentUrl,
      v.report,
    );
  }
  @Post("offers/:id/fund") fund(
    @Param("id") id: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    return this.collaboration.fund(
      parse(idSchema, id),
      req.actor!.id,
      parse(z.object({ version: versionSchema }).strict(), body).version,
    );
  }
  @Get("partners/:id/campaign-applications") ownCampaignApplications(
    @Param("id") id: string,
    @Req() req: AuthRequest,
    @Query() raw: unknown,
  ) {
    return this.collaboration.ownApplications(
      parse(idSchema, id),
      req.actor!.id,
      parse(pageQuery, raw),
    );
  }
  @Post("partners/:id/campaign-applications/:applicationId/withdraw")
  withdrawApplication(
    @Param("id") id: string,
    @Param("applicationId") applicationId: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    return this.collaboration.withdrawApplication(
      parse(idSchema, applicationId),
      parse(idSchema, id),
      req.actor!.id,
      parse(z.object({ version: z.number().int().min(0) }).strict(), body)
        .version,
    );
  }
  @Get("stores/:slug/campaigns") async campaigns(
    @Param("slug") slug: string,
    @Req() req: AuthRequest,
    @Query() raw: unknown,
  ) {
    return this.collaboration.campaigns(
      (await this.scope(slug, req)).id,
      parse(pageQuery, raw),
    );
  }
  @Post("stores/:slug/campaigns") @ApiInput(campaign) async createCampaign(
    @Param("slug") slug: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    return this.collaboration.createCampaign(
      (await this.scope(slug, req, true)).id,
      req.actor!.id,
      parse(campaign, body),
    );
  }
  @Post("stores/:slug/campaigns/:id/close") async closeCampaign(
    @Param("slug") slug: string,
    @Param("id") id: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    return this.collaboration.closeCampaign(
      parse(idSchema, id),
      (await this.scope(slug, req, true)).id,
      req.actor!.id,
      parse(z.object({ version: versionSchema }).strict(), body).version,
    );
  }
  @Post("campaigns/:id/applications") async apply(
    @Param("id") id: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    const v = parse(
      z.object({ partnerId: idSchema, note: text(1000) }).strict(),
      body,
    );
    return this.collaboration.apply(
      parse(idSchema, id),
      v.partnerId,
      req.actor!.id,
      v.note,
    );
  }
  @Get("stores/:slug/campaigns/:id/applications") async applications(
    @Param("slug") slug: string,
    @Param("id") id: string,
    @Req() req: AuthRequest,
    @Query() raw: unknown,
  ) {
    return this.collaboration.applications(
      parse(idSchema, id),
      (await this.scope(slug, req)).id,
      parse(pageQuery, raw),
    );
  }
  @Post("stores/:slug/campaign-applications/:id/decision") async select(
    @Param("slug") slug: string,
    @Param("id") id: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    const v = parse(
      z
        .object({
          version: versionSchema,
          status: z.enum(["accepted", "rejected"]),
        })
        .strict(),
      body,
    );
    return this.collaboration.select(
      parse(idSchema, id),
      (await this.scope(slug, req, true)).id,
      req.actor!.id,
      v.version,
      v.status,
    );
  }
  @Get("stores/:slug/audit") async storeAudit(
    @Param("slug") slug: string,
    @Req() req: AuthRequest,
    @Query() raw: unknown,
  ) {
    return this.audit.list(
      (await this.stores.owned(slug, req.actor!.id)).id,
      parse(pageQuery, raw),
    );
  }
  @Get("platform/audit")
  @PlatformPermission("audit")
  @UseGuards(PlatformGuard)
  platformAudit(@Query() raw: unknown) {
    return this.audit.list(undefined, parse(pageQuery, raw));
  }
  @Post("offers/:id/cancellation") cancelOffer(
    @Param("id") id: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    const v = parse(
      z
        .object({
          version: z.number().int().min(0),
          action: z.enum(["request", "approve", "reject"]),
        })
        .strict(),
      body,
    );
    return this.collaboration.cancelOffer(
      parse(idSchema, id),
      req.actor!.id,
      v.version,
      v.action,
    );
  }
}
@Controller("public/campaigns")
export class PublicCampaignController {
  constructor(private readonly collaboration: CollaborationService) {}
  @Get() list(@Query() raw: unknown) {
    return this.collaboration.campaigns(undefined, parse(pageQuery, raw), true);
  }
}
