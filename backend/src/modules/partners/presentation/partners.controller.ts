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
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { z } from "zod";
import { PartnersService } from "../application/partners.service";
import { ApplicationsService } from "../../applications/application/applications.service";
import { SessionGuard } from "../../auth/presentation/session.guard";
import {
  PlatformGuard,
  PlatformPermission,
} from "../../auth/presentation/platform.guard";
import { MediaService } from "../../media/application/media.service";
import {
  parse,
  text,
  idSchema,
  moneySchema,
  ApiInput,
} from "../../../shared/validation";
import { pageQuery } from "../../../shared/page";
import type { AuthRequest } from "../../../shared/http";
const kindSchema = z.enum(["supplier", "influencer"]),
  versionSchema = z.number().int().min(0),
  url = z.union([z.literal(""), z.url().startsWith("https://").max(300)]);
const profile = z
  .object({
    version: versionSchema,
    name: text(150).min(2),
    bio: text(1000),
    city: text(100),
    category: text(80),
    logo: text(200),
    links: z
      .array(
        z
          .object({
            platform: text(40).min(1),
            url: z.url().startsWith("https://").max(300),
          })
          .strict(),
      )
      .max(8),
    portfolio: z
      .array(
        z
          .object({
            id: idSchema,
            title: text(100).min(1),
            image: text(200),
            url,
          })
          .strict(),
      )
      .max(30),
  })
  .strict()
  .refine(
    (v) => new Set(v.portfolio.map((p) => p.id)).size === v.portfolio.length,
  );
const supply = z
  .object({
    name: text(150).min(1),
    sku: text(60).min(1),
    category: text(80),
    description: text(2000),
    priceCents: moneySchema,
    stock: z.number().int().min(0).max(9999999),
    minimum: z.number().int().min(1).max(9999),
    images: z.array(text(200)).max(6),
    active: z.boolean(),
  })
  .strict();
const decision = z
  .object({
    version: versionSchema,
    status: z.enum(["approved", "rejected"]),
    reason: text(1000).min(1),
    ownerId: idSchema.optional(),
  })
  .strict();
@Controller()
export class PartnersController {
  constructor(
    private readonly partners: PartnersService,
    private readonly applications: ApplicationsService,
    private readonly media: MediaService,
  ) {}
  @Get("platform/partners")
  @UseGuards(SessionGuard, PlatformGuard)
  @PlatformPermission("members")
  administrativeList(@Query() raw: unknown) {
    const { kind, ...query } = parse(
      pageQuery.extend({ kind: z.enum(["supplier", "influencer"]) }),
      raw,
    );
    return this.partners.administrativeList(kind, query);
  }
  @Get("public/partners") list(@Query() raw: unknown) {
    const { kind, ...query } = parse(
      pageQuery.extend({ kind: kindSchema }),
      raw,
    );
    return this.partners.list(kind, query);
  }
  @Get("public/partners/:slug") public(@Param("slug") slug: string) {
    return this.partners.public(slug);
  }
  @Get("public/partners/:slug/products") async productsPublic(
    @Param("slug") slug: string,
    @Query() raw: unknown,
  ) {
    const partner = await this.partners.public(slug);
    return this.partners.products(partner.id, parse(pageQuery, raw), true);
  }
  @Get("account/partners") @UseGuards(SessionGuard) owned(
    @Req() req: AuthRequest,
  ) {
    return this.partners.owned(req.actor!.id);
  }
  @Get("account/partner-applications")
  @UseGuards(SessionGuard)
  applicationsOwned(@Req() req: AuthRequest) {
    return this.applications.owned(req.actor!.id);
  }
  @Get("partners/:id") @UseGuards(SessionGuard) get(
    @Param("id") id: string,
    @Req() req: AuthRequest,
  ) {
    return this.partners.access(parse(idSchema, id), req.actor!.id, "read");
  }
  @Put("partners/:id/profile") @UseGuards(SessionGuard) @ApiInput(profile) save(
    @Param("id") id: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    const { version: expectedVersion, ...input } = parse(profile, body);
    return this.partners.save(
      parse(idSchema, id),
      req.actor!.id,
      expectedVersion,
      input,
    );
  }
  @Get("partners/:id/products") @UseGuards(SessionGuard) async products(
    @Param("id") id: string,
    @Req() req: AuthRequest,
    @Query() raw: unknown,
  ) {
    await this.partners.access(
      parse(idSchema, id),
      req.actor!.id,
      "catalog-read",
    );
    return this.partners.products(id, parse(pageQuery, raw), false);
  }
  @Post("partners/:id/products")
  @UseGuards(SessionGuard)
  @ApiInput(supply)
  createProduct(
    @Param("id") id: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    return this.partners.saveProduct(
      parse(idSchema, id),
      req.actor!.id,
      parse(supply, body),
    );
  }
  @Put("partners/:id/products/:productId")
  @UseGuards(SessionGuard)
  @ApiInput(supply.extend({ version: versionSchema }))
  updateProduct(
    @Param("id") id: string,
    @Param("productId") productId: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    const { version: expectedVersion, ...input } = parse(
      supply.extend({ version: versionSchema }),
      body,
    );
    return this.partners.saveProduct(
      parse(idSchema, id),
      req.actor!.id,
      input,
      parse(idSchema, productId),
      expectedVersion,
    );
  }
  @Post("partners/:id/media")
  @UseGuards(SessionGuard)
  @UseInterceptors(
    FileInterceptor("file", {
      limits: { fileSize: 15 * 1024 * 1024, files: 1, fields: 0 },
    }),
  )
  async upload(
    @Param("id") id: string,
    @Req() req: AuthRequest,
    @Query("kind") raw: unknown,
    @UploadedFile() file: { buffer: Buffer; size: number } | undefined,
  ) {
    await this.partners.access(
      parse(idSchema, id),
      req.actor!.id,
      "catalog-write",
    );
    return this.media.upload(
      id,
      parse(z.enum(["product", "logo", "banner"]), raw),
      file,
    );
  }
  @Post("platform/applications/:id/decision")
  @PlatformPermission("members")
  @UseGuards(SessionGuard, PlatformGuard)
  @ApiInput(decision)
  decide(
    @Param("id") id: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    const v = parse(decision, body);
    return this.partners.decide(
      parse(idSchema, id),
      v.version,
      v.status,
      v.reason,
      req.actor!.id,
      v.ownerId,
    );
  }
  @Put("platform/partners/:id/status")
  @PlatformPermission("members")
  @UseGuards(SessionGuard, PlatformGuard)
  status(
    @Param("id") id: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    const v = parse(
      z
        .object({
          version: versionSchema,
          status: z.enum(["active", "suspended"]),
        })
        .strict(),
      body,
    );
    return this.partners.status(
      parse(idSchema, id),
      v.version,
      v.status,
      req.actor!.id,
    );
  }
}
