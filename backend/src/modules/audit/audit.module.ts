import { Global, Module } from "@nestjs/common";
import { AUDIT } from "./application/audit.repository";
import { AuditService } from "./application/audit.service";
import { MongoAuditRepository } from "./infrastructure/mongo-audit.repository";
@Global()
@Module({
  providers: [AuditService, { provide: AUDIT, useClass: MongoAuditRepository }],
  exports: [AuditService],
})
export class AuditModule {}
