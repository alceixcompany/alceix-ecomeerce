import { UsersService } from "../../users/application/users.service";
import { pageQuery } from "../../../shared/page";
import { notFound } from "../../../shared/errors";
import {
  Controller,
  Get,
  Post,
  Req,
  Param,
  Body,
  Query,
  UseGuards,
} from "@nestjs/common";
import { z } from "zod";
import { NotificationsService } from "../application/notifications.service";
import { SessionGuard } from "../../auth/presentation/session.guard";
import {
  PlatformGuard,
  PlatformPermission,
} from "../../auth/presentation/platform.guard";
import { parse, idSchema, text, ApiInput } from "../../../shared/validation";
import type { AuthRequest } from "../../../shared/http";
const broadcast = z
  .object({
    requestId: idSchema,
    subject: text(200).min(1),
    message: text(8000).min(1),
    recipients: z
      .array(idSchema)
      .min(1)
      .max(1000)
      .refine((v) => new Set(v).size === v.length),
    consent: z.literal(true),
  })
  .strict();
@Controller("platform")
@UseGuards(SessionGuard, PlatformGuard)
export class PlatformCommunicationsController {
  constructor(
    private readonly notifications: NotificationsService,
    private readonly users: UsersService,
  ) {}
  @Post("email-broadcasts")
  @PlatformPermission("email")
  @ApiInput(broadcast)
  email(@Req() req: AuthRequest, @Body() body: unknown) {
    const { requestId, consent: _consent, ...input } = parse(broadcast, body);
    return this.notifications.platformSend(
      req.actor!.id,
      requestId,
      "email",
      input,
    );
  }
  @Post("sms-broadcasts") @PlatformPermission("sms") @ApiInput(broadcast) sms(
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    const { requestId, consent: _consent, ...input } = parse(broadcast, body);
    return this.notifications.platformSend(
      req.actor!.id,
      requestId,
      "sms",
      input,
    );
  }
  @Get("email-broadcasts/:id") @PlatformPermission("email") async emailRead(
    @Param("id") id: string,
  ) {
    const batch = await this.notifications.batch(
      parse(idSchema, id),
      "platform",
    );
    if (batch.channel !== "email") throw notFound();
    return batch;
  }
  @Get("sms-broadcasts/:id") @PlatformPermission("sms") async smsRead(
    @Param("id") id: string,
  ) {
    const batch = await this.notifications.batch(
      parse(idSchema, id),
      "platform",
    );
    if (batch.channel !== "sms") throw notFound();
    return batch;
  }
  @Post("email-broadcasts/:id/cancel") @PlatformPermission("email") cancelEmail(
    @Param("id") id: string,
    @Body() body: unknown,
  ) {
    return this.notifications.cancelBatch(
      parse(idSchema, id),
      "platform",
      parse(z.object({ version: z.number().int().min(0) }).strict(), body)
        .version,
      "email",
    );
  }
  @Post("sms-broadcasts/:id/cancel") @PlatformPermission("sms") cancelSms(
    @Param("id") id: string,
    @Body() body: unknown,
  ) {
    return this.notifications.cancelBatch(
      parse(idSchema, id),
      "platform",
      parse(z.object({ version: z.number().int().min(0) }).strict(), body)
        .version,
      "sms",
    );
  }
  @Get("email-recipients") @PlatformPermission("email") emailRecipients(
    @Query() query: unknown,
  ) {
    return this.users.marketingList("email", parse(pageQuery, query));
  }
  @Get("sms-recipients") @PlatformPermission("sms") smsRecipients(
    @Query() query: unknown,
  ) {
    return this.users.marketingList("sms", parse(pageQuery, query));
  }
}
