import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Req,
  Body,
  UseGuards,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { z } from "zod";
import { SessionGuard } from "../../auth/presentation/session.guard";
import type { AuthRequest } from "../../../shared/http";
import { ApiInput, parse, idSchema } from "../../../shared/validation";
import { StoresService } from "../application/stores.service";
import { TeamService } from "../application/team.service";
const role = z.enum(["editor", "support", "viewer"]);
const invite = z.object({ email: z.email().max(254), role }).strict();
const update = z.object({ role, version: z.number().int().min(0) }).strict();
const remove = z.object({ version: z.number().int().min(0) }).strict();
const accept = z.object({ token: z.string().regex(/^[a-f0-9]{64}$/) }).strict();
@ApiTags("team")
@UseGuards(SessionGuard)
@Controller()
export class TeamController {
  constructor(
    private readonly stores: StoresService,
    private readonly team: TeamService,
  ) {}
  @Get("stores/:slug/team") async list(
    @Param("slug") slug: string,
    @Req() req: AuthRequest,
  ) {
    return this.team.list(await this.stores.owned(slug, req.actor!.id));
  }
  @Post("stores/:slug/team/invitations") @ApiInput(invite) async invite(
    @Param("slug") slug: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    const store = await this.stores.owned(slug, req.actor!.id),
      input = parse(invite, body);
    return this.team.invite(store, input.email, input.role);
  }
  @Put("stores/:slug/team/:id") @ApiInput(update) async role(
    @Param("slug") slug: string,
    @Param("id") id: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    const store = await this.stores.owned(slug, req.actor!.id),
      input = parse(update, body);
    return this.team.role(
      store.id,
      parse(idSchema, id),
      input.version,
      input.role,
    );
  }
  @Post("stores/:slug/team/:id/revoke") @ApiInput(remove) async revoke(
    @Param("slug") slug: string,
    @Param("id") id: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    const store = await this.stores.owned(slug, req.actor!.id);
    return this.team.remove(
      store.id,
      parse(idSchema, id),
      parse(remove, body).version,
    );
  }
  @Post("team/accept") @ApiInput(accept) async accept(
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    const result = await this.team.accept(
      parse(accept, body).token,
      req.actor!.id,
    );
    const store = await this.stores.byId(result.storeId);
    return { message: result.message, slug: store.slug };
  }
  @Post("stores/:slug/team/:id/reissue") @ApiInput(remove) async reissue(
    @Param("slug") slug: string,
    @Param("id") id: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    return this.team.reissue(
      (await this.stores.owned(slug, req.actor!.id)).id,
      parse(idSchema, id),
      parse(remove, body).version,
    );
  }
}
