import { ReferralsModule } from "./modules/referrals/referrals.module";
import { LiveSupportModule } from "./modules/live-support/live-support.module";
import { StudioModule } from "./modules/studio/studio.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { WholesaleModule } from "./modules/wholesale/wholesale.module";
import { CouponsModule } from "./modules/coupons/coupons.module";
import { ReviewsModule } from "./modules/reviews/reviews.module";
import { AccountsModule } from "./modules/accounts/accounts.module";
import { CommerceModule } from "./modules/commerce/commerce.module";
import { FinanceModule } from "./modules/finance/finance.module";
import { JobsModule } from "./modules/jobs/jobs.module";
import { IntegrationsModule } from "./modules/integrations/integrations.module";
import { CollaborationModule } from "./modules/collaboration/collaboration.module";
import { PartnersModule } from "./modules/partners/partners.module";
import { AuditModule } from "./modules/audit/audit.module";
import { PlatformModule } from "./modules/platform/platform.module";
import { OrdersModule } from "./modules/orders/orders.module";
import { DesignModule } from "./modules/design/design.module";
import { CrmModule } from "./modules/crm/crm.module";
import { SupportModule } from "./modules/support/support.module";
import { ContactModule } from "./modules/contact/contact.module";
import {
  DynamicModule,
  Global,
  Module,
  Controller,
  Get,
  Inject,
} from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import type { Connection } from "mongoose";
import { CONFIG, type AppConfig } from "./config/config";
import { DatabaseModule, DATABASE } from "./infrastructure/database";
import { OriginGuard } from "./shared/http";
import { AuthModule } from "./modules/auth/auth.module";
import { StoresApiModule } from "./modules/stores/stores-api.module";
import { CatalogModule } from "./modules/catalog/catalog.module";
import { ApplicationsModule } from "./modules/applications/applications.module";
import { EngagementModule } from "./modules/engagement/engagement.module";
import { DashboardModule } from "./modules/dashboard/dashboard.module";
import { unavailable } from "./shared/errors";
@Global()
@Module({})
class ConfigurationModule {
  static register(config: AppConfig): DynamicModule {
    return {
      module: ConfigurationModule,
      providers: [{ provide: CONFIG, useValue: config }],
      exports: [CONFIG],
    };
  }
}
@Controller("health")
class HealthController {
  constructor(@Inject(DATABASE) private readonly db: Connection) {}
  @Get("live") live() {
    return { status: "ok" };
  }
  @Get("ready") async ready() {
    try {
      await this.db.db!.command({ ping: 1 });
      return { status: "ok" };
    } catch {
      throw unavailable("Veritabanı hazır değil.");
    }
  }
}
@Module({})
export class AppModule {
  static register(config: AppConfig): DynamicModule {
    return {
      module: AppModule,
      imports: [
        ConfigurationModule.register(config),
        DatabaseModule,
        AuditModule,
        PartnersModule,
        CollaborationModule,
        IntegrationsModule,
        JobsModule,
        FinanceModule,
        CommerceModule,
        AccountsModule,
        ReviewsModule,
        CouponsModule,
        WholesaleModule,
        NotificationsModule,
        StudioModule,
        AuthModule,
        StoresApiModule,
        CatalogModule,
        ApplicationsModule,
        EngagementModule,
        DashboardModule,
        CrmModule,
        SupportModule,
        ContactModule,
        PlatformModule,
        ReferralsModule,
        LiveSupportModule,
        OrdersModule,
        DesignModule,
      ],
      controllers: [HealthController],
      providers: [{ provide: APP_GUARD, useClass: OriginGuard }],
    };
  }
}
