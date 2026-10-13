import { Module } from "@nestjs/common";
import { StoresModule } from "../stores/stores.module";
import { PartnersModule } from "../partners/partners.module";
import { CollaborationModule } from "../collaboration/collaboration.module";
import { FinanceModule } from "../finance/finance.module";
import { JobsModule } from "../jobs/jobs.module";
import { IntegrationsModule } from "../integrations/integrations.module";
import { CatalogModule } from "../catalog/catalog.module";
import { MediaModule } from "../media/media.module";
import { WHOLESALE } from "./application/wholesale.repository";
import { WholesaleService } from "./application/wholesale.service";
import { MongoWholesaleRepository } from "./infrastructure/mongo-wholesale.repository";
import { WholesaleController } from "./presentation/wholesale.controller";
@Module({
  imports: [
    StoresModule,
    PartnersModule,
    CollaborationModule,
    FinanceModule,
    JobsModule,
    IntegrationsModule,
    CatalogModule,
    MediaModule,
  ],
  providers: [
    WholesaleService,
    { provide: WHOLESALE, useClass: MongoWholesaleRepository },
  ],
  controllers: [WholesaleController],
  exports: [WholesaleService],
})
export class WholesaleModule {}
