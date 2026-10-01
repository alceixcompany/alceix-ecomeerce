import { Module } from "@nestjs/common";
import { StoresModule } from "../stores/stores.module";
import { CatalogModule } from "../catalog/catalog.module";
import { DashboardController } from "./presentation/dashboard.controller";
@Module({
  imports: [StoresModule, CatalogModule],
  controllers: [DashboardController],
})
export class DashboardModule {}
