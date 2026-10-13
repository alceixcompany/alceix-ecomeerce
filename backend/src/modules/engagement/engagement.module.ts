import { CrmModule } from "../crm/crm.module";
import { Module } from "@nestjs/common";
import { StoresModule } from "../stores/stores.module";
import { CatalogModule } from "../catalog/catalog.module";
import { ENGAGEMENT } from "./application/engagement.repository";
import { EngagementService } from "./application/engagement.service";
import { MongoEngagementRepository } from "./infrastructure/mongo-engagement.repository";
import { EngagementController } from "./presentation/engagement.controller";
@Module({
  imports: [StoresModule, CatalogModule, CrmModule],
  exports: [EngagementService],
  controllers: [EngagementController],
  providers: [
    EngagementService,
    { provide: ENGAGEMENT, useClass: MongoEngagementRepository },
  ],
})
export class EngagementModule {}
