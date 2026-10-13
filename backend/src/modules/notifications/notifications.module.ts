import { PlatformCommunicationsController } from "./presentation/platform-communications.controller";
import { CouponsModule } from "../coupons/coupons.module";
import { Module } from "@nestjs/common";
import { UsersModule } from "../users/users.module";
import { StoresModule } from "../stores/stores.module";
import { CrmModule } from "../crm/crm.module";
import { JobsModule } from "../jobs/jobs.module";
import { IntegrationsModule } from "../integrations/integrations.module";
import { NOTIFICATIONS } from "./application/notifications.repository";
import { NotificationsService } from "./application/notifications.service";
import { MongoNotificationsRepository } from "./infrastructure/mongo-notifications.repository";
import { NotificationsController } from "./presentation/notifications.controller";
import { NotificationsWorker } from "./infrastructure/notifications.worker";
@Module({
  imports: [
    UsersModule,
    CouponsModule,
    StoresModule,
    CrmModule,
    JobsModule,
    IntegrationsModule,
  ],
  providers: [
    NotificationsService,
    NotificationsWorker,
    { provide: NOTIFICATIONS, useClass: MongoNotificationsRepository },
  ],
  controllers: [NotificationsController, PlatformCommunicationsController],
  exports: [NotificationsService],
})
export class NotificationsModule {}
