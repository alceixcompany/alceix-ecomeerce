import { JobsModule } from "../jobs/jobs.module";
import { NotificationsModule } from "../notifications/notifications.module";
import { Module } from "@nestjs/common";
import { CONTACT } from "./application/contact.repository";
import { ContactService } from "./application/contact.service";
import { MongoContactRepository } from "./infrastructure/mongo-contact.repository";
import { ContactController } from "./presentation/contact.controller";
@Module({
  imports: [NotificationsModule, JobsModule],
  exports: [ContactService],
  controllers: [ContactController],
  providers: [
    ContactService,
    { provide: CONTACT, useClass: MongoContactRepository },
  ],
})
export class ContactModule {}
