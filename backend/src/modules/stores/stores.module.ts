import { Module } from "@nestjs/common";
import { STORES } from "./application/stores.repository";
import { StoresService } from "./application/stores.service";
import { MongoStoresRepository } from "./infrastructure/mongo-stores.repository";
@Module({
  providers: [
    StoresService,
    { provide: STORES, useClass: MongoStoresRepository },
  ],
  exports: [StoresService],
})
export class StoresModule {}
