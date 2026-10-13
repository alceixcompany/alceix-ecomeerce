import { Module } from "@nestjs/common";
import { StoresModule } from "../stores/stores.module";
import { OrdersModule } from "../orders/orders.module";
import { JobsModule } from "../jobs/jobs.module";
import { IntegrationsModule } from "../integrations/integrations.module";
import { INVOICES } from "./application/invoices.repository";
import { InvoicesService } from "./application/invoices.service";
import { MongoInvoicesRepository } from "./infrastructure/mongo-invoices.repository";
import { InvoicesController } from "./presentation/invoices.controller";
@Module({
  imports: [StoresModule, OrdersModule, JobsModule, IntegrationsModule],
  providers: [
    InvoicesService,
    { provide: INVOICES, useClass: MongoInvoicesRepository },
  ],
  controllers: [InvoicesController],
  exports: [InvoicesService],
})
export class InvoicesModule {}
