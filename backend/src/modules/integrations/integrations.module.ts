import { Module } from "@nestjs/common";
import { GATEWAY } from "./application/gateway.port";
import { IntegrationsService } from "./application/integrations.service";
import { HttpGateway } from "./infrastructure/http-gateway";
@Module({
  providers: [IntegrationsService, { provide: GATEWAY, useClass: HttpGateway }],
  exports: [IntegrationsService],
})
export class IntegrationsModule {}
