import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  Req,
  Res,
  UseGuards,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { z } from "zod";
import type { Response } from "express";
import { SupportService } from "../application/support.service";
import { AttachmentsService } from "../application/attachments.service";
import { StoresService } from "../../stores/application/stores.service";
import { SessionGuard } from "../../auth/presentation/session.guard";
import { parse, text, idSchema } from "../../../shared/validation";
import { pageQuery } from "../../../shared/page";
import type { AuthRequest } from "../../../shared/http";
@Controller("public/stores/:slug/support")
@UseGuards(SessionGuard)
export class BuyerSupportController {
  constructor(
    private readonly support: SupportService,
    private readonly attachments: AttachmentsService,
    private readonly stores: StoresService,
  ) {}
  @Get() async list(
    @Param("slug") slug: string,
    @Req() req: AuthRequest,
    @Query() raw: unknown,
  ) {
    const query = parse(pageQuery, raw);
    return this.support.buyerList(
      (await this.stores.bySlug(slug)).id,
      req.actor!.id,
      { ...query, channel: "customer", status: "all", priority: "all" },
    );
  }
  @Post() async create(
    @Param("slug") slug: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    const v = parse(
      z
        .object({
          category: text(80).min(1),
          subject: text(150).min(1),
          text: text(4000).min(1),
        })
        .strict(),
      body,
    );
    return this.support.create(
      (await this.stores.bySlug(slug)).id,
      { ...v, channel: "customer", priority: "normal" },
      req.actor!,
      req.actor!.id,
    );
  }
  @Get(":id") async get(
    @Param("slug") slug: string,
    @Param("id") id: string,
    @Req() req: AuthRequest,
  ) {
    return this.support.buyerTicket(
      (await this.stores.bySlug(slug)).id,
      parse(idSchema, id),
      req.actor!.id,
    );
  }
  @Post(":id/replies") async reply(
    @Param("slug") slug: string,
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
          attachments: z.array(idSchema).max(3).default([]),
        })
        .strict(),
      body,
    );
    return this.support.buyerReply(
      (await this.stores.bySlug(slug)).id,
      parse(idSchema, id),
      req.actor!.id,
      v.version,
      v.messageId,
      v.text,
      req.actor!,
      v.attachments,
    );
  }
  @Post("attachments")
  @UseInterceptors(
    FileInterceptor("file", {
      limits: { fileSize: 2 * 1024 * 1024, files: 1, fields: 0 },
    }),
  )
  async upload(
    @Param("slug") slug: string,
    @Req() req: AuthRequest,
    @UploadedFile()
    file:
      | { buffer: Buffer; size: number; originalname: string; mimetype: string }
      | undefined,
  ) {
    return this.attachments.upload(
      (await this.stores.bySlug(slug)).id,
      file,
      req.actor!.id,
    );
  }
  @Get(":id/attachments/:fileId") async attachment(
    @Param("slug") slug: string,
    @Param("id") id: string,
    @Param("fileId") fileId: string,
    @Req() req: AuthRequest,
    @Res() response: Response,
  ) {
    const { file, buffer } = await this.support.buyerAttachment(
      (await this.stores.bySlug(slug)).id,
      parse(idSchema, id),
      req.actor!.id,
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
}
