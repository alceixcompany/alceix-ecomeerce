import { AuthService } from "../../auth/application/auth.service";
import { Inject, Injectable } from "@nestjs/common";
import { UsersService } from "../../users/application/users.service";
import { StoresService } from "../../stores/application/stores.service";
import { PartnersService } from "../../partners/application/partners.service";
import { AuditService } from "../../audit/application/audit.service";
import type {
  PlatformStaff,
  AccountControl,
} from "../../users/domain/platform-access";
import {
  TRANSACTIONS,
  type TransactionRunner,
} from "../../../shared/transactions";
@Injectable()
export class PlatformOperationsService {
  constructor(
    private readonly users: UsersService,
    private readonly auth: AuthService,
    private readonly stores: StoresService,
    private readonly partners: PartnersService,
    private readonly audit: AuditService,
    @Inject(TRANSACTIONS) private readonly tx: TransactionRunner,
  ) {}
  staff(
    actorId: string,
    id: string,
    version: number,
    input: Omit<PlatformStaff, "version">,
  ) {
    return this.tx.run(async () => {
      await this.users.requirePlatformAdmin(actorId);
      const saved = await this.users.staff(id, version, input);
      await this.audit.append(actorId, "platform", "staff.update", id);
      return saved;
    });
  }
  control(
    actorId: string,
    id: string,
    version: number,
    input: Omit<AccountControl, "version">,
  ) {
    return this.tx.run(async () => {
      const saved = await this.users.control(id, version, input);
      if (input.status === "paused") await this.auth.revokeUserSessions(id);
      await this.stores.suspendOwner(id, input.status === "paused");
      await this.partners.suspendOwner(id, input.status === "paused");
      await this.audit.append(
        actorId,
        "platform",
        "account." + input.status,
        id,
      );
      return saved;
    });
  }
}
