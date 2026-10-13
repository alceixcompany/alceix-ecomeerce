import { CouponsModule } from "../coupons/coupons.module";
import { UsersModule } from "../users/users.module";
import { Module } from "@nestjs/common";
import { StoresModule } from "../stores/stores.module";
import { CatalogModule } from "../catalog/catalog.module";
import { OrdersService } from "./application/orders.service";
import { ORDERS } from "./application/orders.repository";
import { MongoOrdersRepository } from "./infrastructure/mongo-orders.repository";
import { ReservationSweeper } from "./infrastructure/reservation-sweeper";
import {
  OrdersController,
  BuyerOrdersController,
} from "./presentation/orders.controller";
@Module({
  imports: [StoresModule, CatalogModule, UsersModule, CouponsModule],
  providers: [
    OrdersService,
    ReservationSweeper,
    { provide: ORDERS, useClass: MongoOrdersRepository },
  ],
  controllers: [OrdersController, BuyerOrdersController],
  exports: [OrdersService],
})
export class OrdersModule {}
