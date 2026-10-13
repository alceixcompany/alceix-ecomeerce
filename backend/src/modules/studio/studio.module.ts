import { PartnersModule } from "../partners/partners.module";
import { Module } from "@nestjs/common";
import { StoresModule } from "../stores/stores.module";
import { CatalogModule } from "../catalog/catalog.module";
import { MediaModule } from "../media/media.module";
import { UsersModule } from "../users/users.module";
import { JobsModule } from "../jobs/jobs.module";
import { IntegrationsModule } from "../integrations/integrations.module";
import { FinanceModule } from "../finance/finance.module";
import { STUDIO } from "./application/studio.repository";
import { StudioService } from "./application/studio.service";
import { MongoStudioRepository } from "./infrastructure/mongo-studio.repository";
import { StudioController } from "./presentation/studio.controller";
@Module({
  imports: [
    StoresModule,
    PartnersModule,
    CatalogModule,
    MediaModule,
    UsersModule,
    JobsModule,
    IntegrationsModule,
    FinanceModule,
  ],
  providers: [
    StudioService,
    { provide: STUDIO, useClass: MongoStudioRepository },
  ],
  controllers: [StudioController],
  exports: [StudioService],
})
export class StudioModule {}
