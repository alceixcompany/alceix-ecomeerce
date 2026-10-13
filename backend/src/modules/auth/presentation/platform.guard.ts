import {
  Injectable,
  SetMetadata,
  type CanActivate,
  type ExecutionContext,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { UsersService } from "../../users/application/users.service";
import type { PlatformPage } from "../../users/domain/platform-access";
import type { AuthRequest } from "../../../shared/http";
import { notFound, unauthorized } from "../../../shared/errors";
export const PlatformPermission = (page: PlatformPage) =>
  SetMetadata("platform-page", page);
@Injectable()
export class PlatformGuard implements CanActivate {
  constructor(
    private readonly users: UsersService,
    private readonly reflector: Reflector,
  ) {}
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<AuthRequest>();
    if (!request.actor) throw unauthorized();
    const user = await this.users.findById(request.actor.id);
    if (!user || user.accountControl?.status === "paused") throw notFound();
    if (user.platformAdmin) return true;
    const page = this.reflector.getAllAndOverride<PlatformPage | undefined>(
      "platform-page",
      [context.getHandler(), context.getClass()],
    );
    const access = user.platformStaff;
    // Unannotated endpoints remain root-only. Read permission never grants mutation.
    if (
      !page ||
      access?.status !== "active" ||
      !access.pages.includes(page) ||
      (!["GET", "HEAD"].includes(request.method) && !access.write)
    )
      throw notFound();
    return true;
  }
}
