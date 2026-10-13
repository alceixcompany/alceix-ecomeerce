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
import { ApiTags } from "@nestjs/swagger";
import { z } from "zod";
import { CrmService } from "../application/crm.service";
import { StoresService } from "../../stores/application/stores.service";
import { SessionGuard } from "../../auth/presentation/session.guard";
import type { AuthRequest } from "../../../shared/http";
import { ApiInput, idSchema, parse, text } from "../../../shared/validation";
const customer = z
  .object({
    name: text(80).min(1),
    email: z
      .email()
      .max(120)
      .transform((s) => s.toLowerCase()),
    phone: text(40),
    city: text(80),
    consent: z.boolean(),
    note: text(1000),
  })
  .strict();
const version = z.number().int().min(0);
const settings = z
  .object({
    earnRate: z.number().int().min(1).max(10000),
    pointCents: z.number().int().min(1).max(10000),
    abandonedEnabled: z.boolean(),
    delayHours: z.number().int().min(1).max(168),
    discount: z.number().int().min(0).max(50),
    template: text(500),
  })
  .strict();
const querySchema = z
  .object({
    q: text(120).default(""),
    segment: z.enum(["all", "vip", "new", "cart", "inactive"]).default("all"),
    spend: z.enum(["all", "high", "low"]).default("all"),
    last: z.enum(["all", "recent", "inactive"]).default("all"),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(5),
  })
  .strict();
const segment = z.enum(["all", "vip", "new", "cart", "inactive"]);
const communication = z
  .object({
    kind: z.enum(["campaign", "email"]),
    segment,
    subject: text(150),
    message: text(5000).min(1),
  })
  .strict()
  .refine((input) => input.kind !== "campaign" || input.message.length <= 500, {
    path: ["message"],
    message: "Kampanya taslağı en fazla 500 karakter olabilir.",
  })
  .refine((input) => input.kind !== "email" || input.subject.length > 0, {
    path: ["subject"],
    message: "E-posta konusunu yazın.",
  });
const createCommunication = communication.safeExtend({ requestId: idSchema });
const updateCommunication = communication.safeExtend({ version });
const draftsQuery = z
  .object({
    kind: z.enum(["campaign", "email"]),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(5),
  })
  .strict();
@ApiTags("crm")
@Controller("stores/:slug/crm")
@UseGuards(SessionGuard)
export class CrmController {
  constructor(
    private readonly stores: StoresService,
    private readonly crm: CrmService,
  ) {}
  private async scope(slug: string, request: AuthRequest) {
    return (
      await this.stores.owned(
        slug,
        request.actor!.id,
        request.method === "GET" ? "crm-read" : "crm-write",
      )
    ).id;
  }
  @Get("customers") async list(
    @Param("slug") slug: string,
    @Req() req: AuthRequest,
    @Query() query: unknown,
  ) {
    return this.crm.list(
      await this.scope(slug, req),
      parse(querySchema, query),
    );
  }
  @Post("customers") @ApiInput(customer) async create(
    @Param("slug") slug: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    return this.crm.create(await this.scope(slug, req), parse(customer, body));
  }
  @Put("customers/:id") @ApiInput(customer.extend({ version })) async update(
    @Param("slug") slug: string,
    @Param("id") id: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    const input = parse(customer.extend({ version }), body);
    const { version: revision, ...fields } = input;
    return this.crm.update(
      await this.scope(slug, req),
      parse(idSchema, id),
      revision,
      fields,
    );
  }
  @Get("communication-recipients") async recipients(
    @Param("slug") slug: string,
    @Req() req: AuthRequest,
    @Query() query: unknown,
  ) {
    const input = parse(z.object({ segment }).strict(), query);
    return this.crm.recipients(await this.scope(slug, req), input.segment);
  }
  @Get("communications") async drafts(
    @Param("slug") slug: string,
    @Req() req: AuthRequest,
    @Query() query: unknown,
  ) {
    const input = parse(draftsQuery, query);
    return this.crm.communications(
      await this.scope(slug, req),
      input.kind,
      input.page,
      input.limit,
    );
  }
  @Post("communications") @ApiInput(createCommunication) async createDraft(
    @Param("slug") slug: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    const { requestId, ...input } = parse(createCommunication, body);
    return this.crm.createCommunication(
      await this.scope(slug, req),
      requestId,
      input,
    );
  }
  @Put("communications/:id") @ApiInput(updateCommunication) async updateDraft(
    @Param("slug") slug: string,
    @Param("id") id: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    const { version, ...input } = parse(updateCommunication, body);
    return this.crm.updateCommunication(
      await this.scope(slug, req),
      parse(idSchema, id),
      version,
      input,
    );
  }
  @Get("settings") async settings(
    @Param("slug") slug: string,
    @Req() req: AuthRequest,
  ) {
    return this.crm.settings(await this.scope(slug, req));
  }
  @Put("settings")
  @ApiInput(z.object({ version, settings }).strict())
  async saveSettings(
    @Param("slug") slug: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    const input = parse(z.object({ version, settings }).strict(), body);
    return this.crm.saveSettings(
      await this.scope(slug, req),
      input.version,
      input.settings,
    );
  }
}
