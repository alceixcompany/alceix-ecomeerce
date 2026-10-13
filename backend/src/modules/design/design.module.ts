import { Module } from "@nestjs/common";
import { StoresModule } from "../stores/stores.module";
import { MediaModule } from "../media/media.module";
import { DesignService } from "./application/design.service";
import { DESIGN } from "./application/design.repository";
import { MongoDesignRepository } from "./infrastructure/mongo-design.repository";
import {
  DesignController,
  PublishedDesignController,
} from "./presentation/design.controller";
@Module({
  imports: [StoresModule, MediaModule],
  providers: [
    DesignService,
    { provide: DESIGN, useClass: MongoDesignRepository },
  ],
  controllers: [DesignController, PublishedDesignController],
  exports: [DesignService],
})
export class DesignModule {}
