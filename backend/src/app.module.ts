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
        AuthModule,
        StoresApiModule,
        CatalogModule,
        ApplicationsModule,
        EngagementModule,
        DashboardModule,
      ],
      controllers: [HealthController],
      providers: [{ provide: APP_GUARD, useClass: OriginGuard }],
    };
  }
}
