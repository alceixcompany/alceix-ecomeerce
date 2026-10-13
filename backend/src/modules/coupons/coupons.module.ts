import { Module } from "@nestjs/common";
import { StoresModule } from "../stores/stores.module";
import { COUPONS } from "./application/coupons.repository";
import { CouponsService } from "./application/coupons.service";
import { MongoCouponsRepository } from "./infrastructure/mongo-coupons.repository";
import { CouponsController } from "./presentation/coupons.controller";
@Module({
  imports: [StoresModule],
  providers: [
    CouponsService,
    { provide: COUPONS, useClass: MongoCouponsRepository },
  ],
  controllers: [CouponsController],
  exports: [CouponsService],
})
export class CouponsModule {}
