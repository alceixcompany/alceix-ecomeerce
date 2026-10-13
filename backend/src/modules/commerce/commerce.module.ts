import { UsersModule } from "../users/users.module";
import { InvoicesModule } from "../invoices/invoices.module";
import { ReferralsModule } from "../referrals/referrals.module";
import { CrmModule } from "../crm/crm.module";
import { StudioModule } from "../studio/studio.module";
import { NotificationsModule } from "../notifications/notifications.module";
import { WholesaleModule } from "../wholesale/wholesale.module";
import { EngagementModule } from "../engagement/engagement.module";
import { CouponsModule } from "../coupons/coupons.module";
import { Module } from "@nestjs/common";
import { OrdersModule } from "../orders/orders.module";
import { StoresModule } from "../stores/stores.module";
import { JobsModule } from "../jobs/jobs.module";
import { FinanceModule } from "../finance/finance.module";
import { IntegrationsModule } from "../integrations/integrations.module";
import { COMMERCE } from "./application/commerce.repository";
import { CommerceService } from "./application/commerce.service";
import { MongoCommerceRepository } from "./infrastructure/mongo-commerce.repository";
import {
  CommerceController,
  IntegrationEventsController,
  PlatformCommerceController,
  PlatformReconciliationController,
} from "./presentation/commerce.controller";
import { CommerceWorker } from "./infrastructure/commerce.worker";
@Module({
  imports: [
    CrmModule,
    ReferralsModule,
    OrdersModule,
    UsersModule,
    InvoicesModule,
    StoresModule,
    JobsModule,
    FinanceModule,
    IntegrationsModule,
    CouponsModule,
    EngagementModule,
    WholesaleModule,
    NotificationsModule,
    StudioModule,
  ],
  providers: [
    CommerceService,
    CommerceWorker,
    { provide: COMMERCE, useClass: MongoCommerceRepository },
  ],
  controllers: [
    CommerceController,
    IntegrationEventsController,
    PlatformCommerceController,
    PlatformReconciliationController,
  ],
  exports: [CommerceService],
})
export class CommerceModule {}
