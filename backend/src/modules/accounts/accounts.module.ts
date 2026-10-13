import { JobsModule } from "../jobs/jobs.module";
import { IntegrationsModule } from "../integrations/integrations.module";
import { AccountVerificationService } from "./application/account-verification.service";
import { AccountVerificationController } from "./presentation/account-verification.controller";
import { Module } from "@nestjs/common";
import { UsersModule } from "../users/users.module";
import { StoresModule } from "../stores/stores.module";
import { ACCOUNTS } from "./application/accounts.repository";
import { AccountsService } from "./application/accounts.service";
import { MongoAccountsRepository } from "./infrastructure/mongo-accounts.repository";
import { AccountsController } from "./presentation/accounts.controller";
@Module({
  imports: [UsersModule, StoresModule, JobsModule, IntegrationsModule],
  providers: [
    AccountsService,
    AccountVerificationService,
    { provide: ACCOUNTS, useClass: MongoAccountsRepository },
  ],
  controllers: [AccountsController, AccountVerificationController],
})
export class AccountsModule {}
