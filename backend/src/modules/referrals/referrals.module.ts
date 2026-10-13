import { Module } from "@nestjs/common";
import { UsersModule } from "../users/users.module";
import { StoresModule } from "../stores/stores.module";
import { CouponsModule } from "../coupons/coupons.module";
import { FinanceModule } from "../finance/finance.module";
import { REFERRALS } from "./application/referrals.repository";
import { ReferralsService } from "./application/referrals.service";
import { MongoReferralsRepository } from "./infrastructure/mongo-referrals.repository";
import { ReferralsController } from "./presentation/referrals.controller";
@Module({
  imports: [UsersModule, StoresModule, CouponsModule, FinanceModule],
  providers: [
    ReferralsService,
    { provide: REFERRALS, useClass: MongoReferralsRepository },
  ],
  controllers: [ReferralsController],
  exports: [ReferralsService],
})
export class ReferralsModule {}
