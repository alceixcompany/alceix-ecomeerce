import { OrdersModule } from "../orders/orders.module";
import { FinanceModule } from "../finance/finance.module";
import { PlatformOperationsService } from "./application/platform-operations.service";
import { PlatformOperationsController } from "./presentation/platform-operations.controller";
import { PartnersModule } from "../partners/partners.module";
import { UsersModule } from "../users/users.module";
import { Module } from "@nestjs/common";
import { StoresModule } from "../stores/stores.module";
import { ApplicationsModule } from "../applications/applications.module";
import { ContactModule } from "../contact/contact.module";
import { SupportModule } from "../support/support.module";
import { PlatformController } from "./presentation/platform.controller";
@Module({
  imports: [
    UsersModule,
    OrdersModule,
    FinanceModule,
    PartnersModule,
    StoresModule,
    ApplicationsModule,
    ContactModule,
    SupportModule,
  ],
  controllers: [PlatformController, PlatformOperationsController],
  providers: [PlatformOperationsService],
})
export class PlatformModule {}
