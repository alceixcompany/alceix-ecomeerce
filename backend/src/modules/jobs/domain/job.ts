import type {
  GatewayOperation,
  GatewayRequests,
  GatewayResults,
} from "../../integrations/application/gateway.port";
export type IntegrationJob = {
  id: string;
  scopeId: string;
  ownerId: string;
  operation: GatewayOperation;
  input: GatewayRequests[GatewayOperation];
  status:
    "queued" | "processing" | "awaiting" | "succeeded" | "failed" | "cancelled";
  result?: GatewayResults[GatewayOperation];
  attempts: number;
  maxAttempts?: number;
  availableAt: Date;
  leaseUntil?: Date;
  leaseId?: string;
  lastError: string;
  reconcileAfter?: Date;
  createdAt: Date;
  version: number;
};
export type ProviderEvent = {
  id: string;
  referenceId: string;
  kind: string;
  fingerprint: string;
  createdAt: Date;
};
