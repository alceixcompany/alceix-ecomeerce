import type { Response } from "express";
import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Req,
  Body,
  UseGuards,
  Res,
} from "@nestjs/common";
import { z } from "zod";
import { SessionGuard } from "../../auth/presentation/session.guard";
import {
  PlatformGuard,
  PlatformPermission,
} from "../../auth/presentation/platform.guard";
import { PartnersService } from "../../partners/application/partners.service";
import { SupportService } from "../application/support.service";
import { parse, idSchema, text } from "../../../shared/validation";
import type { AuthRequest } from "../../../shared/http";
@Controller("platform/partners/:partnerId/support")
@UseGuards(SessionGuard, PlatformGuard)
@PlatformPermission("support")
export class PlatformPartnerSupportController {
  constructor(
    private readonly partners: PartnersService,
    private readonly support: SupportService,
  ) {}
  private async scope(partnerId: string) {
    return (await this.partners.get(parse(idSchema, partnerId))).id;
  }
  @Get(":id") async get(
    @Param("partnerId") partnerId: string,
    @Param("id") id: string,
  ) {
    return this.support.platformTicket(
      await this.scope(partnerId),
      parse(idSchema, id),
    );
  }
  @Get(":id/attachments/:fileId") async attachment(
    @Param("partnerId") partnerId: string,
    @Param("id") id: string,
    @Param("fileId") fileId: string,
    @Res() response: Response,
  ) {
    const { file, buffer } = await this.support.platformAttachment(
      await this.scope(partnerId),
      parse(idSchema, id),
      parse(idSchema, fileId),
    );
    response
      .type("application/octet-stream")
      .set(
        "Content-Disposition",
        `attachment; filename="attachment"; filename*=UTF-8''${encodeURIComponent(file.name)}`,
      )
      .send(buffer);
  }
  @Post(":id/replies") async reply(
    @Param("partnerId") partnerId: string,
    @Param("id") id: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    const v = parse(
      z
        .object({
          version: z.number().int().min(0),
          messageId: idSchema,
          text: text(4000).min(1),
        })
        .strict(),
      body,
    );
    const scope = await this.scope(partnerId);
    await this.support.platformTicket(scope, parse(idSchema, id));
    return this.support.reply(
      scope,
      id,
      v.version,
      v.messageId,
      v.text,
      req.actor!,
      "support",
    );
  }
  @Put(":id/status") async status(
    @Param("partnerId") partnerId: string,
    @Param("id") id: string,
    @Body() body: unknown,
  ) {
    const v = parse(
      z
        .object({
          version: z.number().int().min(0),
          status: z.enum(["open", "waiting", "resolved"]),
        })
        .strict(),
      body,
    );
    const scope = await this.scope(partnerId);
    await this.support.platformTicket(scope, parse(idSchema, id));
    return this.support.status(scope, id, v.version, v.status);
  }
}
