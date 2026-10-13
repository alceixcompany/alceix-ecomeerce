import { Module } from "@nestjs/common";
import { UsersModule } from "../users/users.module";
import { StoresModule } from "../stores/stores.module";
import { PartnersModule } from "../partners/partners.module";
import { LIVE_SUPPORT } from "./application/live.repository";
import { LiveSupportService } from "./application/live.service";
import { MongoLiveRepository } from "./infrastructure/mongo-live.repository";
import {
  LiveSupportController,
  PlatformLiveController,
} from "./presentation/live.controller";
@Module({
  imports: [UsersModule, StoresModule, PartnersModule],
  providers: [
    LiveSupportService,
    { provide: LIVE_SUPPORT, useClass: MongoLiveRepository },
  ],
  controllers: [LiveSupportController, PlatformLiveController],
})
export class LiveSupportModule {}
