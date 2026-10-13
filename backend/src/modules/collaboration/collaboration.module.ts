import { NotificationsModule } from "../notifications/notifications.module";
import { FinanceModule } from "../finance/finance.module";
import { UsersModule } from "../users/users.module";
import { Module } from "@nestjs/common";
import { PartnersModule } from "../partners/partners.module";
import { StoresModule } from "../stores/stores.module";
import { COLLABORATION } from "./application/collaboration.repository";
import { CollaborationService } from "./application/collaboration.service";
import { MongoCollaborationRepository } from "./infrastructure/mongo-collaboration.repository";
import {
  CollaborationController,
  PublicCampaignController,
} from "./presentation/collaboration.controller";
@Module({
  imports: [
    PartnersModule,
    StoresModule,
    UsersModule,
    FinanceModule,
    NotificationsModule,
  ],
  providers: [
    CollaborationService,
    { provide: COLLABORATION, useClass: MongoCollaborationRepository },
  ],
  controllers: [CollaborationController, PublicCampaignController],
  exports: [CollaborationService],
})
export class CollaborationModule {}
