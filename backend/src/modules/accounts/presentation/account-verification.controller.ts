import {
  Controller,
  Get,
  Post,
  Put,
  Req,
  Body,
  UseGuards,
} from "@nestjs/common";
import { z } from "zod";
import { AccountVerificationService } from "../application/account-verification.service";
import { UsersService } from "../../users/application/users.service";
import { SessionGuard } from "../../auth/presentation/session.guard";
import { parse, idSchema } from "../../../shared/validation";
import type { AuthRequest } from "../../../shared/http";
@Controller("account")
@UseGuards(SessionGuard)
export class AccountVerificationController {
  constructor(
    private readonly verification: AccountVerificationService,
    private readonly users: UsersService,
  ) {}
  @Post("phone-verification") start(
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    return this.verification.start(
      req.actor!.id,
      parse(z.object({ requestId: idSchema }).strict(), body).requestId,
    );
  }
  @Post("phone-verification/verify") verify(
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    const v = parse(
      z
        .object({
          challengeId: idSchema,
          requestId: idSchema,
          code: z.string().regex(/^[0-9]{6}$/),
        })
        .strict(),
      body,
    );
    return this.verification.verify(
      req.actor!.id,
      v.challengeId,
      v.requestId,
      v.code,
    );
  }
  @Get("communication-preferences") preferences(@Req() req: AuthRequest) {
    return this.users.preferences(req.actor!.id);
  }
  @Put("communication-preferences") save(
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    const v = parse(
      z
        .object({
          version: z.number().int().min(0),
          email: z.boolean(),
          sms: z.boolean(),
        })
        .strict(),
      body,
    );
    return this.users.savePreferences(req.actor!.id, v.version, v.email, v.sms);
  }
}
