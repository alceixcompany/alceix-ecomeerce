import { Inject, Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { AUDIT, type AuditRepository } from "./audit.repository";
import type { PageQuery } from "../../../shared/page";
@Injectable()
export class AuditService {
  constructor(@Inject(AUDIT) private readonly repository: AuditRepository) {}
  append(actorId: string, scopeId: string, action: string, subjectId: string) {
    return this.repository.append({
      id: randomUUID(),
      actorId,
      scopeId,
      action,
      subjectId,
      createdAt: new Date(),
    });
  }
  list(scopeId: string | undefined, query: PageQuery) {
    return this.repository.list(scopeId, query);
  }
}
