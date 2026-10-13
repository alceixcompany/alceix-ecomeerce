import { FinanceModule } from "../finance/finance.module";
import { IntegrationsModule } from "../integrations/integrations.module";
import { OrdersModule } from "../orders/orders.module";
import { CrmModule } from "../crm/crm.module";
import { Module } from "@nestjs/common";
import { StoresModule } from "../stores/stores.module";
import { CatalogModule } from "../catalog/catalog.module";
import { DashboardController } from "./presentation/dashboard.controller";
@Module({
  imports: [
    StoresModule,
    CatalogModule,
    CrmModule,
    OrdersModule,
    FinanceModule,
    IntegrationsModule,
  ],
  controllers: [DashboardController],
})
export class DashboardModule {}
