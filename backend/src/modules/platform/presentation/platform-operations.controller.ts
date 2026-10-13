import {
  Controller,
  Get,
  Put,
  Req,
  Query,
  Param,
  Body,
  UseGuards,
} from "@nestjs/common";
import { z } from "zod";
import { PlatformOperationsService } from "../application/platform-operations.service";
import { UsersService } from "../../users/application/users.service";
import { platformPages } from "../../users/domain/platform-access";
import { SessionGuard } from "../../auth/presentation/session.guard";
import {
  PlatformGuard,
  PlatformPermission,
} from "../../auth/presentation/platform.guard";
import { parse, idSchema, text, ApiInput } from "../../../shared/validation";
import { pageQuery } from "../../../shared/page";
import type { AuthRequest } from "../../../shared/http";
const staff = z
  .object({
    version: z.number().int().min(0),
    role: z.enum(["operations", "support", "finance", "marketing", "custom"]),
    pages: z.array(z.enum(platformPages)).max(platformPages.length),
    write: z.boolean(),
    status: z.enum(["active", "paused"]),
  })
  .strict()
  .refine((v) => new Set(v.pages).size === v.pages.length);
const control = z
  .object({
    version: z.number().int().min(0),
    status: z.enum(["active", "review", "paused"]),
    verified: z.boolean(),
    note: text(2000),
  })
  .strict();
@Controller("platform")
@UseGuards(SessionGuard, PlatformGuard)
export class PlatformOperationsController {
  constructor(
    private readonly operations: PlatformOperationsService,
    private readonly users: UsersService,
  ) {}
  @Get("staff") staffList(@Query() query: unknown) {
    return this.users.administrativeList(parse(pageQuery, query), true);
  }
  @Put("staff/:id") @ApiInput(staff) staff(
    @Param("id") id: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    const { version, ...input } = parse(staff, body);
    return this.operations.staff(
      req.actor!.id,
      parse(idSchema, id),
      version,
      input,
    );
  }
  @Get("accounts") @PlatformPermission("members") accounts(
    @Query() query: unknown,
  ) {
    return this.users.administrativeList(parse(pageQuery, query));
  }
  @Put("accounts/:id/control")
  @PlatformPermission("members")
  @ApiInput(control)
  control(
    @Param("id") id: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    const { version, ...input } = parse(control, body);
    return this.operations.control(
      req.actor!.id,
      parse(idSchema, id),
      version,
      input,
    );
  }
}
