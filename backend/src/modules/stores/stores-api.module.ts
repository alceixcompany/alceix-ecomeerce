import { Module } from "@nestjs/common";
import { StoresModule } from "./stores.module";
import { MediaModule } from "../media/media.module";
import { StoresController } from "./presentation/stores.controller";
@Module({
  imports: [StoresModule, MediaModule],
  controllers: [StoresController],
})
export class StoresApiModule {}
