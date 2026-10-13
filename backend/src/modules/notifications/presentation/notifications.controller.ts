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
import { NotificationsService } from "../application/notifications.service";
import { StoresService } from "../../stores/application/stores.service";
import { SessionGuard } from "../../auth/presentation/session.guard";
import { parse, idSchema } from "../../../shared/validation";
import { pageQuery } from "../../../shared/page";
import type { AuthRequest } from "../../../shared/http";
@Controller()
export class NotificationsController {
  constructor(
    private readonly notifications: NotificationsService,
    private readonly stores: StoresService,
  ) {}
  @Get("account/notifications") @UseGuards(SessionGuard) inbox(
    @Req() req: AuthRequest,
    @Query() raw: unknown,
  ) {
    const q = parse(pageQuery, raw);
    return this.notifications.inbox(req.actor!.id, q.page, q.limit);
  }
  @Put("account/notifications/:id/read") @UseGuards(SessionGuard) read(
    @Param("id") id: string,
    @Req() req: AuthRequest,
  ) {
    return this.notifications.read(req.actor!.id, parse(idSchema, id));
  }
  @Post("stores/:slug/communications/:id/send")
  @UseGuards(SessionGuard)
  async send(
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
          channel: z.enum(["email", "sms", "whatsapp"]).default("email"),
        })
        .strict(),
      body,
    );
    return this.notifications.sendDraft(
      (await this.stores.owned(slug, req.actor!.id, "crm-write")).id,
      req.actor!.id,
      v.requestId,
      parse(idSchema, id),
      v.version,
      v.channel,
    );
  }
  @Get("stores/:slug/delivery-batches/:id")
  @UseGuards(SessionGuard)
  async batch(
    @Param("slug") slug: string,
    @Param("id") id: string,
    @Req() req: AuthRequest,
  ) {
    return this.notifications.batch(
      parse(idSchema, id),
      (await this.stores.owned(slug, req.actor!.id, "crm-read")).id,
    );
  }
  @Post("communications/unsubscribe") unsubscribe(@Body() body: unknown) {
    return this.notifications.unsubscribe(
      parse(
        z.object({ token: z.string().regex(/^[a-f0-9]{64}$/) }).strict(),
        body,
      ).token,
    );
  }
  @Put("public/stores/:slug/communication-preferences")
  @UseGuards(SessionGuard)
  async preferences(
    @Param("slug") slug: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    return this.notifications.preferences(
      (await this.stores.publicBySlug(slug)).id,
      req.actor!.id,
      parse(z.object({ active: z.boolean() }).strict(), body).active,
    );
  }
  @Post("stores/:slug/delivery-batches/:id/cancel")
  @UseGuards(SessionGuard)
  async cancel(
    @Param("slug") slug: string,
    @Param("id") id: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    return this.notifications.cancelBatch(
      parse(idSchema, id),
      (await this.stores.owned(slug, req.actor!.id, "crm-write")).id,
      parse(z.object({ version: z.number().int().min(0) }).strict(), body)
        .version,
    );
  }
}
