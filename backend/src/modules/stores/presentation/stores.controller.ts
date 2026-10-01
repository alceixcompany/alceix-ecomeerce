import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { z } from "zod";
import { StoresService } from "../application/stores.service";
import { settingsOf } from "../domain/store";
import { SessionGuard } from "../../auth/presentation/session.guard";
import { MediaService } from "../../media/application/media.service";
import { ApiInput, parse, text } from "../../../shared/validation";
import type { AuthRequest } from "../../../shared/http";
const settingsSchema = z
  .object({
    name: text(60).min(2),
    company: text(150),
    slug: z
      .string()
      .max(60)
      .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
    bio: text(300),
    instagram: text(40).regex(/^@?[a-zA-Z0-9_.]*$/),
    tiktok: text(40).regex(/^@?[a-zA-Z0-9_.]*$/),
    whatsapp: text(25).regex(/^[+0-9 ()-]*$/),
    youtube: z.union([z.literal(""), z.url().startsWith("https://")]),
    seoTitle: text(70),
    seoDescription: text(160),
    isOpen: z.boolean(),
    mode: z.enum(["normal", "maintenance", "holiday"]),
    bannerImage: text(200),
    logoImage: text(200),
    faviconImage: text(200),
  })
  .strict();
const saveSchema = settingsSchema.extend({ version: z.number().int().min(0) });
@ApiTags("stores")
@UseGuards(SessionGuard)
@Controller("stores/:slug")
export class StoresController {
  constructor(
    private readonly stores: StoresService,
    private readonly media: MediaService,
  ) {}
  @Get() async get(@Param("slug") slug: string, @Req() request: AuthRequest) {
    return this.stores.profile(
      await this.stores.owned(slug, request.actor!.id),
    );
  }
  @Get("settings/draft") async draft(
    @Param("slug") slug: string,
    @Req() request: AuthRequest,
  ) {
    const store = await this.stores.owned(slug, request.actor!.id);
    return { settings: store.draft ?? null, version: store.version };
  }
  @Put("settings") @ApiInput(saveSchema) save(
    @Param("slug") slug: string,
    @Req() request: AuthRequest,
    @Body() body: unknown,
  ) {
    return this.persist(slug, request.actor!.id, body, false);
  }
  @Put("settings/draft") @ApiInput(saveSchema) saveDraft(
    @Param("slug") slug: string,
    @Req() request: AuthRequest,
    @Body() body: unknown,
  ) {
    return this.persist(slug, request.actor!.id, body, true);
  }
  private async persist(
    slug: string,
    userId: string,
    body: unknown,
    draft: boolean,
  ) {
    const { version, ...settings } = parse(saveSchema, body),
      store = await this.stores.owned(slug, userId);
    await this.media.assertOwned(store.id, [settings.bannerImage], "banner");
    await this.media.assertOwned(store.id, [settings.logoImage], "logo");
    await this.media.assertOwned(store.id, [settings.faviconImage], "favicon");
    const saved = await this.stores.save(store, settings, version, draft);
    return { ...settingsOf(saved), id: saved.id, version: saved.version };
  }
}
