import {
  Controller,
  Get,
  Post,
  Put,
  Req,
  Param,
  Query,
  Body,
  UseGuards,
} from "@nestjs/common";
import { z } from "zod";
import { LiveSupportService } from "../application/live.service";
import { SessionGuard } from "../../auth/presentation/session.guard";
import {
  PlatformGuard,
  PlatformPermission,
} from "../../auth/presentation/platform.guard";
import { parse, text, idSchema, ApiInput } from "../../../shared/validation";
import { pageQuery } from "../../../shared/page";
import type { AuthRequest } from "../../../shared/http";
const create = z
  .object({
    requestId: idSchema,
    source: z.enum(["buyer", "store", "supplier", "creator"]),
    sourceId: z.union([z.literal(""), idSchema]).default(""),
    subject: text(200).min(1),
  })
  .strict();
const message = z
    .object({ messageId: idSchema, text: text(4000).min(1) })
    .strict(),
  version = z.object({ version: z.number().int().min(0) }).strict();
@Controller("account/live-support")
@UseGuards(SessionGuard)
export class LiveSupportController {
  constructor(private readonly live: LiveSupportService) {}
  @Post() @ApiInput(create) create(
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    const v = parse(create, body);
    return this.live.create(
      req.actor!.id,
      v.requestId,
      v.source,
      v.sourceId,
      v.subject,
    );
  }
  @Get() list(@Req() req: AuthRequest, @Query() query: unknown) {
    return this.live.list(parse(pageQuery, query), req.actor!.id);
  }
  @Get(":id") get(@Param("id") id: string, @Req() req: AuthRequest) {
    return this.live.get(parse(idSchema, id), req.actor!.id, false);
  }
  @Get(":id/messages") messages(
    @Param("id") id: string,
    @Req() req: AuthRequest,
    @Query() query: unknown,
  ) {
    return this.live.messages(
      parse(idSchema, id),
      req.actor!.id,
      false,
      parse(pageQuery, query),
    );
  }
  @Post(":id/messages") @ApiInput(message) reply(
    @Param("id") id: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    const v = parse(message, body);
    return this.live.reply(
      parse(idSchema, id),
      req.actor!.id,
      false,
      v.messageId,
      v.text,
    );
  }
  @Post(":id/close") @ApiInput(version) close(
    @Param("id") id: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    return this.live.close(
      parse(idSchema, id),
      req.actor!.id,
      false,
      parse(version, body).version,
    );
  }
}
@Controller("platform/live-support")
@UseGuards(SessionGuard, PlatformGuard)
@PlatformPermission("live")
export class PlatformLiveController {
  constructor(private readonly live: LiveSupportService) {}
  @Get() list(@Query() query: unknown) {
    return this.live.list(parse(pageQuery, query));
  }
  @Get(":id") get(@Param("id") id: string, @Req() req: AuthRequest) {
    return this.live.get(parse(idSchema, id), req.actor!.id, true);
  }
  @Get(":id/messages") messages(
    @Param("id") id: string,
    @Req() req: AuthRequest,
    @Query() query: unknown,
  ) {
    return this.live.messages(
      parse(idSchema, id),
      req.actor!.id,
      true,
      parse(pageQuery, query),
    );
  }
  @Post(":id/messages") @ApiInput(message) reply(
    @Param("id") id: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    const v = parse(message, body);
    return this.live.reply(
      parse(idSchema, id),
      req.actor!.id,
      true,
      v.messageId,
      v.text,
    );
  }
  @Post(":id/close") @ApiInput(version) close(
    @Param("id") id: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    return this.live.close(
      parse(idSchema, id),
      req.actor!.id,
      true,
      parse(version, body).version,
    );
  }
  @Put(":id/assignment") assign(
    @Param("id") id: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    const v = parse(
      version.extend({ assignedTo: z.union([z.literal(""), idSchema]) }),
      body,
    );
    return this.live.assign(
      parse(idSchema, id),
      req.actor!.id,
      v.version,
      v.assignedTo,
    );
  }
}
