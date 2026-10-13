import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { z } from "zod";
import { SessionGuard } from "../../auth/presentation/session.guard";
import { StoresService } from "../../stores/application/stores.service";
import { DesignService } from "../application/design.service";
import { ApiInput, parse, text } from "../../../shared/validation";
import type { AuthRequest } from "../../../shared/http";
const section = z
  .object({
    id: text(70).min(1),
    kind: z.enum([
      "hero",
      "collections",
      "products",
      "testimonials",
      "instagram",
      "bento",
      "video",
      "faq",
    ]),
    title: text(80),
    description: text(300),
    visible: z.boolean(),
    videoUrl: text(250),
  })
  .strict();
const design = z
  .object({
    announcement: z
      .object({
        enabled: z.boolean(),
        text: text(160),
        tone: z.enum(["blue", "ink", "cream"]),
      })
      .strict(),
    hero: z
      .object({
        title: text(100),
        description: text(200),
        buttonLabel: text(40),
        image: text(200),
      })
      .strict(),
    accent: z.string().regex(/^#[\da-f]{6}$/i),
    background: z.enum(["white", "beige"]),
    font: z.enum(["jakarta", "inter", "serif"]),
    sections: z.array(section).max(10),
  })
  .strict()
  .refine(
    (v) =>
      new Set(v.sections.map((s) => s.id)).size === v.sections.length &&
      new Set(v.sections.map((s) => s.kind)).size === v.sections.length,
  );
const save = z.object({ version: z.number().int().min(0), design }).strict();
@ApiTags("store-design")
@UseGuards(SessionGuard)
@Controller("stores/:slug/design")
export class DesignController {
  constructor(
    private readonly designs: DesignService,
    private readonly stores: StoresService,
  ) {}
  @Get() async get(@Param("slug") slug: string, @Req() req: AuthRequest) {
    return this.designs.get(
      (await this.stores.owned(slug, req.actor!.id, "read")).id,
    );
  }
  @Put("draft") @ApiInput(save) draft(
    @Param("slug") slug: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    return this.persist(slug, req, body, false);
  }
  @Post("publish") @ApiInput(save) publish(
    @Param("slug") slug: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    return this.persist(slug, req, body, true);
  }
  private async persist(
    slug: string,
    req: AuthRequest,
    body: unknown,
    publish: boolean,
  ) {
    const input = parse(save, body);
    return this.designs.save(
      (await this.stores.owned(slug, req.actor!.id, "settings-write")).id,
      input.version,
      input.design,
      publish,
    );
  }
}
@ApiTags("storefront")
@Controller("public/stores/:slug/design")
export class PublishedDesignController {
  constructor(
    private readonly designs: DesignService,
    private readonly stores: StoresService,
  ) {}
  @Get() async get(@Param("slug") slug: string) {
    return this.designs.published((await this.stores.publicBySlug(slug)).id);
  }
}
