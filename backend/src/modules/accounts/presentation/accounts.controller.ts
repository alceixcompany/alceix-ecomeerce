import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
} from "@nestjs/common";
import { z } from "zod";
import { AccountsService } from "../application/accounts.service";
import { SessionGuard } from "../../auth/presentation/session.guard";
import { parse, text, idSchema, ApiInput } from "../../../shared/validation";
import type { AuthRequest } from "../../../shared/http";
const address = z
  .object({
    title: text(80).min(1),
    customer: text(100).min(1),
    phone: text(30),
    city: text(120).min(1),
    address: text(400).min(1),
    isDefault: z.boolean(),
  })
  .strict();
@Controller("account")
@UseGuards(SessionGuard)
export class AccountsController {
  constructor(private readonly accounts: AccountsService) {}
  @Post("stores") createStore(@Req() req: AuthRequest, @Body() body: unknown) {
    const v = parse(
      z.object({ requestId: idSchema, name: text(60).min(2) }).strict(),
      body,
    );
    return this.accounts.createStore(req.actor!.id, v.requestId, v.name);
  }
  @Get("addresses") addresses(@Req() req: AuthRequest) {
    return this.accounts.addresses(req.actor!.id);
  }
  @Post("addresses") @ApiInput(address) createAddress(
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    return this.accounts.saveAddress(req.actor!.id, parse(address, body));
  }
  @Put("addresses/:id") updateAddress(
    @Param("id") id: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    const { version, ...input } = parse(
      address.extend({ version: z.number().int().min(0) }),
      body,
    );
    return this.accounts.saveAddress(
      req.actor!.id,
      input,
      parse(idSchema, id),
      version,
    );
  }
  @Delete("addresses/:id") removeAddress(
    @Param("id") id: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    return this.accounts.removeAddress(
      req.actor!.id,
      parse(idSchema, id),
      parse(z.object({ version: z.number().int().min(0) }).strict(), body)
        .version,
    );
  }
}
