import { Module } from "@nestjs/common";
import { StoresModule } from "../stores/stores.module";
import { CrmController } from "./presentation/crm.controller";
import { CrmService } from "./application/crm.service";
import { CRM } from "./application/crm.repository";
import { MongoCrmRepository } from "./infrastructure/mongo-crm.repository";
@Module({
  imports: [StoresModule],
  controllers: [CrmController],
  providers: [CrmService, { provide: CRM, useClass: MongoCrmRepository }],
  exports: [CrmService],
})
export class CrmModule {}
