import { PartnersModule } from "../partners/partners.module";
import { PartnerSupportController } from "./presentation/partner-support.controller";
import { PlatformPartnerSupportController } from "./presentation/platform-partner-support.controller";
import { SupportCleanupWorker } from "./infrastructure/support-cleanup.worker";
import { UsersModule } from "../users/users.module";
import { BuyerSupportController } from "./presentation/buyer-support.controller";
import { MediaModule } from "../media/media.module";
import { AttachmentsService } from "./application/attachments.service";
import {
  SUPPORT_FILES,
  SUPPORT_FILE_STORAGE,
} from "./application/attachments.ports";
import { MongoSupportFiles } from "./infrastructure/mongo-support-files";
import { LocalSupportFiles } from "./infrastructure/local-support-files";
import { Module } from "@nestjs/common";
import { StoresModule } from "../stores/stores.module";
import { SupportService } from "./application/support.service";
import { SupportController } from "./presentation/support.controller";
import { SUPPORT } from "./application/support.repository";
import { MongoSupportRepository } from "./infrastructure/mongo-support.repository";
@Module({
  imports: [PartnersModule, StoresModule, MediaModule, UsersModule],
  controllers: [
    SupportController,
    BuyerSupportController,
    PartnerSupportController,
    PlatformPartnerSupportController,
  ],
  providers: [
    SupportCleanupWorker,
    SupportService,
    AttachmentsService,
    { provide: SUPPORT_FILES, useClass: MongoSupportFiles },
    { provide: SUPPORT_FILE_STORAGE, useClass: LocalSupportFiles },
    { provide: SUPPORT, useClass: MongoSupportRepository },
  ],
  exports: [SupportService],
})
export class SupportModule {}
