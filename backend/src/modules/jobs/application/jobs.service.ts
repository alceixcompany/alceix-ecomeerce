import { Inject, Injectable } from "@nestjs/common";
import { randomUUID, createHash } from "node:crypto";
import { JOBS, type JobsRepository } from "./jobs.repository";
import type {
  GatewayOperation,
  GatewayRequests,
} from "../../integrations/application/gateway.port";
import { IntegrationsService } from "../../integrations/application/integrations.service";
import {
  TRANSACTIONS,
  type TransactionRunner,
} from "../../../shared/transactions";
import { conflict, notFound } from "../../../shared/errors";
import type { IntegrationJob } from "../domain/job";
import type { PageQuery } from "../../../shared/page";
function canonical(value: unknown): string {
  if (Array.isArray(value)) return "[" + value.map(canonical).join(",") + "]";
  if (value && typeof value === "object")
    return (
      "{" +
      Object.keys(value)
        .sort()
        .map(
          (key) =>
            JSON.stringify(key) +
            ":" +
            canonical((value as Record<string, unknown>)[key]),
        )
        .join(",") +
      "}"
    );
  return JSON.stringify(value) ?? "null";
}
@Injectable()
export class JobsService {
  constructor(
    @Inject(JOBS) private readonly repository: JobsRepository,
    private readonly integrations: IntegrationsService,
    @Inject(TRANSACTIONS) private readonly tx: TransactionRunner,
  ) {}
  async get(id: string) {
    const job = await this.repository.find(id);
    if (!job) throw notFound();
    return job;
  }
  async enqueue<K extends GatewayOperation>(
    id: string,
    scopeId: string,
    ownerId: string,
    operation: K,
    input: GatewayRequests[K],
  ) {
    const old = await this.repository.find(id);
    if (old) {
      if (
        old.scopeId !== scopeId ||
        old.ownerId !== ownerId ||
        old.operation !== operation ||
        JSON.stringify(old.input) !== JSON.stringify(input)
      )
        throw conflict("İşlem kimliği farklı içerikle kullanılmış.");
      return old;
    }
    const job: IntegrationJob = {
      id,
      scopeId,
      ownerId,
      operation,
      input,
      status: "queued",
      attempts: 0,
      maxAttempts: 8,
      availableAt: new Date(),
      lastError: "",
      createdAt: new Date(),
      version: 0,
    };
    await this.repository.create(job);
    return job;
  }
  list(scopeId: string, query: PageQuery) {
    return this.repository.list(scopeId, query);
  }
  async cancel(id: string, ownerId: string, confirmed = false) {
    const saved = await this.repository.cancel(id, ownerId, confirmed);
    if (!saved)
      throw conflict("Gönderilmiş veya çalışmakta olan işlem iptal edilemez.");
    return saved;
  }
  async event(
    eventId: string,
    referenceId: string,
    kind: string,
    payload: unknown,
    work: () => Promise<void>,
  ) {
    const fingerprint = createHash("sha256")
      .update(canonical(payload))
      .digest("hex");
    const replay = async () => {
      const previous = await this.repository.event(eventId);
      if (!previous) return null;
      if (
        previous.referenceId !== referenceId ||
        previous.kind !== kind ||
        previous.fingerprint !== fingerprint
      )
        throw conflict("Webhook kimliği farklı olay için kullanılmış.");
      return { received: true, replay: true };
    };
    try {
      return await this.tx.run(async () => {
        const previous = await replay();
        if (previous) return previous;
        await work();
        await this.repository.appendEvent({
          id: eventId,
          referenceId,
          kind,
          fingerprint,
          createdAt: new Date(),
        });
        return { received: true, replay: false };
      });
    } catch (error) {
      // A concurrent event can win the unique index after our snapshot. Read only after rollback.
      const previous = await replay();
      if (previous) return previous;
      throw error;
    }
  }
  async replay(
    eventId: string,
    referenceId: string,
    kind: string,
    payload: unknown,
  ) {
    const previous = await this.repository.event(eventId);
    if (!previous) return null;
    const fingerprint = createHash("sha256")
      .update(canonical(payload))
      .digest("hex");
    if (
      previous.referenceId !== referenceId ||
      previous.kind !== kind ||
      previous.fingerprint !== fingerprint
    )
      throw conflict();
    return { received: true, replay: true };
  }

  complete(id: string, success: boolean) {
    return this.repository.complete(id, success);
  }
  async retry(id: string, ownerId: string) {
    const saved = await this.repository.retry(id, ownerId);
    if (!saved)
      throw conflict("Yalnız başarısız işlem yeniden gönderilebilir.");
    return saved;
  }

  defer(id: string) {
    return this.repository.defer(id);
  }
  async claim(id?: string) {
    if (!this.integrations.status().configured) return null;
    return this.repository.claim(new Date(), randomUUID(), id);
  }
  async dispatch(job: IntegrationJob) {
    if (job.status !== "processing" || !job.leaseId) throw conflict();
    try {
      const result = await this.integrations.request(
        job.operation,
        job.input,
        job.id,
      );
      await this.repository.finish(
        { ...job, result, status: "awaiting", lastError: "" },
        job.leaseId,
      );
    } catch {
      await this.repository.finish(
        {
          ...job,
          status: job.attempts >= (job.maxAttempts ?? 8) ? "failed" : "queued",
          lastError: "PROVIDER_REQUEST_FAILED",
          availableAt: new Date(
            Date.now() + Math.min(300000, 1000 * 2 ** job.attempts),
          ),
        },
        job.leaseId,
      );
    }
    return { processed: 1 };
  }
  reconciliationCandidate() {
    return this.repository.reconciliationCandidate(new Date());
  }
  async runOnce(id?: string) {
    const job = await this.claim(id);
    return job ? this.dispatch(job) : { processed: 0 };
  }
}
