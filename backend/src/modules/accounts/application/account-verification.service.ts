import { RateLimiter } from "../../../infrastructure/rate-limiter";
import { AppError } from "../../../shared/errors";
import { Injectable, Inject } from "@nestjs/common";
import { UsersService } from "../../users/application/users.service";
import { JobsService } from "../../jobs/application/jobs.service";
import { IntegrationsService } from "../../integrations/application/integrations.service";
import {
  TRANSACTIONS,
  type TransactionRunner,
} from "../../../shared/transactions";
import { conflict, notFound } from "../../../shared/errors";
@Injectable()
export class AccountVerificationService {
  constructor(
    private readonly users: UsersService,
    private readonly limiter: RateLimiter,
    private readonly jobs: JobsService,
    private readonly integrations: IntegrationsService,
    @Inject(TRANSACTIONS) private readonly tx: TransactionRunner,
  ) {}
  async start(actorId: string, id: string) {
    this.integrations.require();
    const user = await this.users.findById(actorId);
    if (
      !user?.phone ||
      !/^\+?[0-9]{9,15}$/.test(user.phone.replace(/[ ()-]/g, ""))
    )
      throw conflict("Önce hesap profilinize geçerli telefon kaydedin.");
    if (!(await this.limiter.consume(actorId, "phone-start", 5)).allowed)
      throw new AppError(
        429,
        "RATE_LIMITED",
        "Yeni telefon kodu için biraz bekleyin.",
      );
    const phone = user.phone.replace(/[ ()-]/g, "");
    await this.tx.run(() =>
      this.jobs.enqueue(id, actorId, actorId, "identity.phone-start", {
        referenceId: id,
        phone,
      }),
    );
    return { id, status: "queued" };
  }
  async verify(actorId: string, id: string, attemptId: string, code: string) {
    const job = await this.jobs.get(id);
    if (
      job.ownerId !== actorId ||
      job.operation !== "identity.phone-start" ||
      !("phone" in job.input) ||
      !job.result ||
      !("expiresAt" in job.result) ||
      !("providerReference" in job.result)
    )
      throw notFound();
    if (new Date(job.result.expiresAt).getTime() <= Date.now())
      throw conflict("Doğrulama kodu süresi dolmuş.");
    const user = await this.users.findById(actorId);
    if (!user?.phone || user.phone.replace(/[ ()-]/g, "") !== job.input.phone)
      throw conflict("Telefon değişmiş; yeni kod isteyin.");
    if (!(await this.limiter.consume(actorId, "phone-verify", 10)).allowed)
      throw new AppError(
        429,
        "RATE_LIMITED",
        "Doğrulama denemesi sınırı aşıldı.",
      );
    const result = await this.integrations.request(
      "identity.phone-verify",
      {
        referenceId: attemptId,
        challengeReference: job.result.providerReference,
        phone: job.input.phone,
        code,
      },
      `phone-verify:${attemptId}`,
    );
    if (!result.verified) throw conflict("Telefon doğrulanamadı.");
    await this.tx.run(async () => {
      if (!(await this.users.verifyPhone(actorId, user.phone!)))
        throw conflict();
      await this.jobs.complete(id, true);
    });
    return { verified: true };
  }
}
