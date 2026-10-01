import {
  Controller,
  Post,
  Get,
  Param,
  Query,
  UploadedFile,
  Req,
  UseGuards,
  UseInterceptors,
  Res,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiConsumes, ApiTags, ApiBody, ApiQuery } from "@nestjs/swagger";
import { z } from "zod";
import type { Response } from "express";
import { MediaService } from "../application/media.service";
import { StoresService } from "../../stores/application/stores.service";
import { SessionGuard } from "../../auth/presentation/session.guard";
import type { AuthRequest } from "../../../shared/http";
import { idSchema, parse } from "../../../shared/validation";
@ApiTags("media")
@Controller()
export class MediaController {
  constructor(
    private readonly media: MediaService,
    private readonly stores: StoresService,
  ) {}
  @Post("stores/:slug/media")
  @UseGuards(SessionGuard)
  @UseInterceptors(
    FileInterceptor("file", {
      limits: { fileSize: 15 * 1024 * 1024, files: 1, fields: 0 },
    }),
  )
  @ApiConsumes("multipart/form-data")
  @ApiQuery({ name: "kind", enum: ["product", "banner", "logo", "favicon"] })
  @ApiBody({
    schema: {
      type: "object",
      properties: { file: { type: "string", format: "binary" } },
      required: ["file"],
    },
  })
  async upload(
    @Param("slug") slug: string,
    @Query("kind") kind: unknown,
    @UploadedFile() file: { buffer: Buffer; size: number } | undefined,
    @Req() request: AuthRequest,
  ) {
    const store = await this.stores.owned(slug, request.actor!.id);
    return this.media.upload(
      store.id,
      parse(z.enum(["product", "banner", "logo", "favicon"]), kind),
      file,
    );
  }
  @Get("media/:id") async read(
    @Param("id") id: string,
    @Res() response: Response,
  ) {
    const buffer = await this.media.read(parse(idSchema, id));
    response
      .type("image/webp")
      .set("Cache-Control", "public, max-age=31536000, immutable")
      .send(buffer);
  }
}
