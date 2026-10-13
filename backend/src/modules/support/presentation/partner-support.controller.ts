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
  UseInterceptors,
  UploadedFile,
  Res,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import type { Response } from "express";
import { AttachmentsService } from "../application/attachments.service";
import { ApiTags, ApiConsumes, ApiBody } from "@nestjs/swagger";
import { z } from "zod";
import { SupportService } from "../application/support.service";
import { ticketView } from "../domain/ticket";
import { PartnersService } from "../../partners/application/partners.service";
import { SessionGuard } from "../../auth/presentation/session.guard";
import type { AuthRequest } from "../../../shared/http";
import { ApiInput, idSchema, parse, text } from "../../../shared/validation";
const version = z.number().int().min(0);
const create = z
  .object({
    channel: z.literal("platform").default("platform"),
    category: text(80).min(1),
    subject: text(160).min(1),
    priority: z.enum(["normal", "high"]),
    text: text(4000).min(1),
  })
  .strict();
const reply = z
  .object({
    version,
    messageId: idSchema,
    text: text(4000),
    attachments: z.array(idSchema).max(3).default([]),
  })
  .strict()
  .refine((v) => v.text.length > 0 || v.attachments.length > 0)
  .refine((v) => new Set(v.attachments).size === v.attachments.length);
const draft = z
  .object({
    version,
    text: text(4000),
    attachments: z.array(idSchema).max(3).default([]),
  })
  .strict()
  .refine(
    (value) => new Set(value.attachments).size === value.attachments.length,
  );
const status = z
  .object({ version, status: z.enum(["open", "waiting", "resolved"]) })
  .strict();
const querySchema = z
  .object({
    channel: z.literal("platform").default("platform"),
    status: z.enum(["all", "open", "waiting", "resolved"]).default("all"),
    priority: z.enum(["all", "normal", "high"]).default("all"),
    q: text(120).default(""),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  })
  .strict();
@ApiTags("support")
@Controller("partners/:partnerId/support")
@UseGuards(SessionGuard)
export class PartnerSupportController {
  constructor(
    private readonly partners: PartnersService,
    private readonly support: SupportService,
    private readonly attachments: AttachmentsService,
  ) {}
  private async scope(partnerId: string, req: AuthRequest) {
    return (
      await this.partners.access(
        parse(idSchema, partnerId),
        req.actor!.id,
        req.method === "GET" ? "support-read" : "support-write",
      )
    ).id;
  }
  @Get() async list(
    @Param("partnerId") partnerId: string,
    @Req() req: AuthRequest,
    @Query() query: unknown,
  ) {
    return this.support.list(
      await this.scope(partnerId, req),
      parse(querySchema, query),
    );
  }
  @Post("attachments")
  @UseInterceptors(
    FileInterceptor("file", {
      limits: { fileSize: 2 * 1024 * 1024, files: 1, fields: 0 },
    }),
  )
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: { file: { type: "string", format: "binary" } },
      required: ["file"],
    },
  })
  async upload(
    @Param("partnerId") partnerId: string,
    @Req() req: AuthRequest,
    @UploadedFile()
    file:
      | { buffer: Buffer; size: number; originalname: string; mimetype: string }
      | undefined,
  ) {
    return this.attachments.upload(await this.scope(partnerId, req), file);
  }
  @Get("attachments/:fileId")
  async download(
    @Param("partnerId") partnerId: string,
    @Param("fileId") fileId: string,
    @Req() req: AuthRequest,
    @Res() response: Response,
  ) {
    const { file, buffer } = await this.attachments.read(
      await this.scope(partnerId, req),
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
  @Get(":id") async get(
    @Param("partnerId") partnerId: string,
    @Param("id") id: string,
    @Req() req: AuthRequest,
  ) {
    const ticket = await this.support.get(
      await this.scope(partnerId, req),
      parse(idSchema, id),
    );
    return ticketView(ticket);
  }
  @Get(":id/draft") draft(
    @Param("partnerId") partnerId: string,
    @Param("id") id: string,
    @Req() req: AuthRequest,
  ) {
    return this.scope(partnerId, req).then((storeId) =>
      this.support.draft(storeId, parse(idSchema, id), req.actor!.id),
    );
  }
  @Put(":id/draft") @ApiInput(draft) async saveDraft(
    @Param("partnerId") partnerId: string,
    @Param("id") id: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    const input = parse(draft, body);
    return this.support.saveDraft(
      await this.scope(partnerId, req),
      parse(idSchema, id),
      req.actor!.id,
      input.version,
      input.text,
      input.attachments,
    );
  }
  @Post() @ApiInput(create) async create(
    @Param("partnerId") partnerId: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    return this.support.create(
      await this.scope(partnerId, req),
      parse(create, body),
      req.actor!,
      undefined,
      "partner",
    );
  }
  @Post(":id/replies") @ApiInput(reply) async reply(
    @Param("partnerId") partnerId: string,
    @Param("id") id: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    const input = parse(reply, body);
    return this.support.reply(
      await this.scope(partnerId, req),
      parse(idSchema, id),
      input.version,
      input.messageId,
      input.text,
      req.actor!,
      "merchant",
      input.attachments,
    );
  }
  @Put(":id/status") @ApiInput(status) async status(
    @Param("partnerId") partnerId: string,
    @Param("id") id: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    const input = parse(status, body);
    return this.support.status(
      await this.scope(partnerId, req),
      parse(idSchema, id),
      input.version,
      input.status,
    );
  }
}
