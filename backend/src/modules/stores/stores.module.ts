import { UsersModule } from "../users/users.module";
import { TeamService } from "./application/team.service";
import { MEMBERSHIPS } from "./application/memberships.repository";
import { MongoMembershipsRepository } from "./infrastructure/mongo-memberships.repository";
import { Module } from "@nestjs/common";
import { STORES } from "./application/stores.repository";
import { StoresService } from "./application/stores.service";
import { MongoStoresRepository } from "./infrastructure/mongo-stores.repository";
@Module({
  imports: [UsersModule],
  providers: [
    TeamService,
    { provide: MEMBERSHIPS, useClass: MongoMembershipsRepository },
    StoresService,
    { provide: STORES, useClass: MongoStoresRepository },
  ],
  exports: [StoresService, TeamService],
})
export class StoresModule {}
