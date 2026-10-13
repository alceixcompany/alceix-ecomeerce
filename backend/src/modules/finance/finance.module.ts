import { Module } from "@nestjs/common";
import { StoresModule } from "../stores/stores.module";
import { PartnersModule } from "../partners/partners.module";
import { UsersModule } from "../users/users.module";
import { JobsModule } from "../jobs/jobs.module";
import { IntegrationsModule } from "../integrations/integrations.module";
import { FINANCE } from "./application/finance.repository";
import { FinanceService } from "./application/finance.service";
import { MongoFinanceRepository } from "./infrastructure/mongo-finance.repository";
import { FinanceController } from "./presentation/finance.controller";
@Module({
  imports: [
    StoresModule,
    PartnersModule,
    UsersModule,
    JobsModule,
    IntegrationsModule,
  ],
  providers: [
    FinanceService,
    { provide: FINANCE, useClass: MongoFinanceRepository },
  ],
  controllers: [FinanceController],
  exports: [FinanceService],
})
export class FinanceModule {}
