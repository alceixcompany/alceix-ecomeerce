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
import { SessionGuard } from "../../auth/presentation/session.guard";
import { PartnersService } from "../application/partners.service";
import { PartnerTeamService } from "../application/partner-team.service";
import { parse, idSchema } from "../../../shared/validation";
import type { AuthRequest } from "../../../shared/http";
const version = z.number().int().min(0),
  role = z.enum(["operations", "finance", "support", "viewer"]);
@Controller()
@UseGuards(SessionGuard)
export class PartnerTeamController {
  constructor(
    private readonly partners: PartnersService,
    private readonly team: PartnerTeamService,
  ) {}
  @Get("partners/:id/capabilities") async capabilities(
    @Param("id") id: string,
    @Req() req: AuthRequest,
  ) {
    const p = await this.partners.access(
      parse(idSchema, id),
      req.actor!.id,
      "read",
    );
    return {
      owner: p.ownerId === req.actor!.id,
      capabilities:
        p.ownerId === req.actor!.id
          ? [
              "owner",
              "read",
              "catalog-read",
              "catalog-write",
              "orders-read",
              "orders-write",
              "collaboration-read",
              "collaboration-write",
              "settings-write",
              "studio-write",
              "finance-read",
              "support-read",
              "support-write",
            ]
          : await this.team.capabilities(p.id, req.actor!.id),
    };
  }
  @Get("partners/:id/team") async list(
    @Param("id") id: string,
    @Req() req: AuthRequest,
  ) {
    return this.team.list(
      await this.partners.owner(parse(idSchema, id), req.actor!.id),
    );
  }
  @Post("partners/:id/team/invitations") async invite(
    @Param("id") id: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    const v = parse(
      z.object({ email: z.email().max(254), role }).strict(),
      body,
    );
    return this.team.invite(
      await this.partners.owner(parse(idSchema, id), req.actor!.id),
      v.email,
      v.role,
    );
  }
  @Post("account/partner-team-invitations/accept") accept(
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    return this.team.accept(
      parse(
        z.object({ token: z.string().regex(/^[a-f0-9]{64}$/) }).strict(),
        body,
      ).token,
      req.actor!.id,
    );
  }
  @Put("partners/:id/team/:memberId/role") async role(
    @Param("id") id: string,
    @Param("memberId") memberId: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    await this.partners.owner(parse(idSchema, id), req.actor!.id);
    const v = parse(z.object({ version, role }).strict(), body);
    return this.team.role(id, parse(idSchema, memberId), v.version, v.role);
  }
  @Put("partners/:id/team/:memberId/status") async status(
    @Param("id") id: string,
    @Param("memberId") memberId: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    await this.partners.owner(parse(idSchema, id), req.actor!.id);
    const v = parse(
      z.object({ version, status: z.enum(["active", "paused"]) }).strict(),
      body,
    );
    return this.team.status(
      id,
      parse(idSchema, memberId),
      v.version,
      v.status,
      req.actor!.id,
    );
  }
  @Post("partners/:id/team/:memberId/reissue") async reissue(
    @Param("id") id: string,
    @Param("memberId") memberId: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    await this.partners.owner(parse(idSchema, id), req.actor!.id);
    return this.team.reissue(
      id,
      parse(idSchema, memberId),
      parse(z.object({ version }).strict(), body).version,
    );
  }
  @Delete("partners/:id/team/:memberId") async remove(
    @Param("id") id: string,
    @Param("memberId") memberId: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    await this.partners.owner(parse(idSchema, id), req.actor!.id);
    return this.team.remove(
      id,
      parse(idSchema, memberId),
      parse(z.object({ version }).strict(), body).version,
    );
  }
}
