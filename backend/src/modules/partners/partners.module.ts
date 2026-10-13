import { PartnerTeamService } from "./application/partner-team.service";
import { PARTNER_MEMBERSHIPS } from "./application/partner-memberships.repository";
import { MongoPartnerMembershipsRepository } from "./infrastructure/mongo-partner-memberships.repository";
import { PartnerTeamController } from "./presentation/partner-team.controller";
import { Module } from "@nestjs/common";
import { ApplicationsModule } from "../applications/applications.module";
import { UsersModule } from "../users/users.module";
import { MediaModule } from "../media/media.module";
import { PARTNERS } from "./application/partners.repository";
import { PartnersService } from "./application/partners.service";
import { MongoPartnersRepository } from "./infrastructure/mongo-partners.repository";
import { PartnersController } from "./presentation/partners.controller";
@Module({
  imports: [ApplicationsModule, UsersModule, MediaModule],
  providers: [
    PartnerTeamService,
    {
      provide: PARTNER_MEMBERSHIPS,
      useClass: MongoPartnerMembershipsRepository,
    },
    PartnersService,
    { provide: PARTNERS, useClass: MongoPartnersRepository },
  ],
  controllers: [PartnersController, PartnerTeamController],
  exports: [PartnersService, PartnerTeamService],
})
export class PartnersModule {}
