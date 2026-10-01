import { Module } from "@nestjs/common";
import { APPLICATIONS } from "./application/applications.repository";
import { ApplicationsService } from "./application/applications.service";
import { MongoApplicationsRepository } from "./infrastructure/mongo-applications.repository";
import { ApplicationsController } from "./presentation/applications.controller";
@Module({
  controllers: [ApplicationsController],
  providers: [
    ApplicationsService,
    { provide: APPLICATIONS, useClass: MongoApplicationsRepository },
  ],
})
export class ApplicationsModule {}
