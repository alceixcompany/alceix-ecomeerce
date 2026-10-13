import { Module } from "@nestjs/common";
import { IntegrationsModule } from "../integrations/integrations.module";
import { JOBS } from "./application/jobs.repository";
import { JobsService } from "./application/jobs.service";
import { MongoJobsRepository } from "./infrastructure/mongo-jobs.repository";
import { JobsWorker } from "./infrastructure/jobs.worker";
@Module({
  imports: [IntegrationsModule],
  providers: [
    JobsService,
    JobsWorker,
    { provide: JOBS, useClass: MongoJobsRepository },
  ],
  exports: [JobsService],
})
export class JobsModule {}
