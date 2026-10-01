import { Module } from "@nestjs/common";
import { StoresModule } from "../stores/stores.module";
import { FILES, MEDIA_RECORDS, IMAGES } from "./application/media.ports";
import { MediaService } from "./application/media.service";
import { SharpImages } from "./infrastructure/sharp-images";
import { LocalFiles } from "./infrastructure/local-files";
import { MongoMediaRepository } from "./infrastructure/mongo-media.repository";
import { MediaController } from "./presentation/media.controller";
@Module({
  imports: [StoresModule],
  controllers: [MediaController],
  providers: [
    MediaService,
    { provide: IMAGES, useClass: SharpImages },
    { provide: FILES, useClass: LocalFiles },
    { provide: MEDIA_RECORDS, useClass: MongoMediaRepository },
  ],
  exports: [MediaService],
})
export class MediaModule {}
