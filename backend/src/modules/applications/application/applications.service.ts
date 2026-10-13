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
  list(page: number, limit: number) {
    return this.repository.list(page, limit);
  }
  get(id: string) {
    return this.repository.find(id);
  }
  save(application: Application, version: number) {
    return this.repository.save(application, version);
  }
  owned(ownerId: string) {
    return this.repository.owned(ownerId);
  }
  async submit(
    type: Application["type"],
    payload: Record<string, string>,
    ownerId?: string,
  ) {
    const application: Application = {
      ownerId,
      version: 0,
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
