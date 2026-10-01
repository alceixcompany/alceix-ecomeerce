import { Injectable, Inject } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import {
  APPLICATIONS,
  type ApplicationsRepository,
  type Application,
} from "./applications.repository";
@Injectable()
export class ApplicationsService {
  constructor(
    @Inject(APPLICATIONS) private readonly repository: ApplicationsRepository,
  ) {}
  async submit(type: Application["type"], payload: Record<string, string>) {
    const application: Application = {
      id: randomUUID(),
      type,
      status: "pending",
      payload,
      createdAt: new Date(),
    };
    await this.repository.create(application);
    return {
      id: application.id,
      status: application.status,
      message: "Başvurunuz alındı.",
    };
  }
}
