import { Module } from "@nestjs/common";
import { StoresModule } from "../stores/stores.module";
import { MediaModule } from "../media/media.module";
import { CATALOG } from "./application/catalog.repository";
import { CatalogService } from "./application/catalog.service";
import { MongoCatalogRepository } from "./infrastructure/mongo-catalog.repository";
import {
  CatalogController,
  StorefrontController,
} from "./presentation/catalog.controller";
@Module({
  imports: [StoresModule, MediaModule],
  controllers: [CatalogController, StorefrontController],
  providers: [
    CatalogService,
    { provide: CATALOG, useClass: MongoCatalogRepository },
  ],
  exports: [CatalogService],
})
export class CatalogModule {}
