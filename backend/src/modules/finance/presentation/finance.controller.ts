import { UsersService } from "../../users/application/users.service";
import { AppError } from "../../../shared/errors";
import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Query,
  Body,
  Req,
  UseGuards,
} from "@nestjs/common";
import { z } from "zod";
import { FinanceService } from "../application/finance.service";
import { StoresService } from "../../stores/application/stores.service";
import { PartnersService } from "../../partners/application/partners.service";
import { SessionGuard } from "../../auth/presentation/session.guard";
import {
  PlatformGuard,
  PlatformPermission,
} from "../../auth/presentation/platform.guard";
import { JobsService } from "../../jobs/application/jobs.service";
import { IntegrationsService } from "../../integrations/application/integrations.service";
import { notFound } from "../../../shared/errors";
import {
  parse,
  text,
  idSchema,
  moneySchema,
  ApiInput,
} from "../../../shared/validation";
import { pageQuery } from "../../../shared/page";
import type { AuthRequest } from "../../../shared/http";
const version = z.number().int().min(0),
  settings = z
    .object({
      version,
      commissionBasisPoints: z.number().int().min(0).max(10000).nullable(),
      returnDays: z.number().int().min(0).max(365).nullable(),
      shippingMode: z.enum(["unconfigured", "fixed", "provider"]),
      fixedShippingCents: moneySchema,
    })
    .strict();
@Controller()
@UseGuards(SessionGuard)
export class FinanceController {
  constructor(
    private readonly finance: FinanceService,
    private readonly users: UsersService,
    private readonly stores: StoresService,
    private readonly partners: PartnersService,
    private readonly jobs: JobsService,
    private readonly integrations: IntegrationsService,
  ) {}
  private async scope(kind: string, scope: string, req: AuthRequest) {
    if (kind === "account" && scope === "me") return req.actor!.id;
    if (kind === "store")
      return (await this.stores.owned(scope, req.actor!.id)).id;
    if (kind === "partner")
      return (
        req.method === "GET"
          ? await this.partners.access(
              parse(idSchema, scope),
              req.actor!.id,
              "finance-read",
              true,
            )
          : await this.partners.owner(parse(idSchema, scope), req.actor!.id)
      ).id;
    return parse(z.literal("store"), kind);
  }
  @Get("wallet/:kind/:scope") async summary(
    @Param("kind") kind: string,
    @Param("scope") scope: string,
    @Req() req: AuthRequest,
  ) {
    return this.finance.summary(await this.scope(kind, scope, req));
  }
  @Get("wallet/:kind/:scope/journal") async journals(
    @Param("kind") kind: string,
    @Param("scope") scope: string,
    @Req() req: AuthRequest,
    @Query() raw: unknown,
  ) {
    return this.finance.journals(
      await this.scope(kind, scope, req),
      parse(pageQuery, raw),
    );
  }
  @Get("wallet/:kind/:scope/bank") async bank(
    @Param("kind") kind: string,
    @Param("scope") scope: string,
    @Req() req: AuthRequest,
  ) {
    return this.finance.bank(await this.scope(kind, scope, req));
  }
  @Post("wallet/:kind/:scope/bank/verify") async verifyBank(
    @Param("kind") kind: string,
    @Param("scope") scope: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    const v = parse(
      z
        .object({
          requestId: idSchema,
          version,
          owner: text(150).min(2),
          iban: text(40).min(1),
        })
        .strict(),
      body,
    );
    return this.finance.verifyBank(
      await this.scope(kind, scope, req),
      req.actor!.id,
      v.requestId,
      v.version,
      v.owner,
      v.iban,
    );
  }
  @Post("wallet/:kind/:scope/withdrawals") async withdraw(
    @Param("kind") kind: string,
    @Param("scope") scope: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    const v = parse(
      z
        .object({ requestId: idSchema, amountCents: moneySchema.min(1) })
        .strict(),
      body,
    );
    return this.finance.withdrawalView(
      await this.finance.withdraw(
        await this.scope(kind, scope, req),
        req.actor!.id,
        v.requestId,
        v.amountCents,
      ),
    );
  }
  @Get("wallet/:kind/:scope/withdrawals") async withdrawalHistory(
    @Param("kind") kind: string,
    @Param("scope") scope: string,
    @Req() req: AuthRequest,
    @Query() raw: unknown,
  ) {
    return this.finance.withdrawals(
      await this.scope(kind, scope, req),
      parse(pageQuery, raw),
    );
  }
  @Get("platform/withdrawals")
  @UseGuards(PlatformGuard)
  @PlatformPermission("finance")
  platformWithdrawals(@Query() raw: unknown) {
    const { status, ...query } = parse(
      pageQuery.extend({
        status: z
          .enum([
            "review",
            "pending",
            "paid",
            "failed",
            "cancelled",
            "rejected",
          ])
          .optional(),
      }),
      raw,
    );
    return this.finance.withdrawals(undefined, query, status);
  }
  @Post("platform/withdrawals/:id/review")
  @UseGuards(PlatformGuard)
  @PlatformPermission("finance")
  reviewWithdrawal(
    @Param("id") id: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    const v = parse(
      z
        .object({
          version,
          action: z.enum(["approve", "reject"]),
          reason: text(1000).min(1),
        })
        .strict(),
      body,
    );
    return this.finance.reviewWithdrawal(
      parse(idSchema, id),
      v.version,
      req.actor!.id,
      v.action,
      v.reason,
    );
  }
  @Post("account/withdrawals/:id/cancel") cancel(
    @Param("id") id: string,
    @Req() req: AuthRequest,
  ) {
    return this.finance
      .cancelWithdrawal(parse(idSchema, id), req.actor!.id)
      .then((item) => this.finance.withdrawalView(item));
  }
  @Get("account/integration-jobs/:id") async job(
    @Param("id") id: string,
    @Req() req: AuthRequest,
  ) {
    const job = await this.jobs.get(parse(idSchema, id));
    if (job.ownerId !== req.actor!.id) throw notFound();
    const {
      input: _input,
      ownerId: _owner,
      leaseId: _lease,
      leaseUntil: _until,
      reconcileAfter: _reconcile,
      ...view
    } = job;
    return view;
  }
  @Get("platform/integrations/status")
  @PlatformPermission("finance")
  @UseGuards(PlatformGuard)
  integrationStatus() {
    return this.integrations.status();
  }
  @Put("platform/stores/:id/commerce-policy")
  @PlatformPermission("finance")
  @UseGuards(PlatformGuard)
  @ApiInput(settings)
  async policy(
    @Param("id") id: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    await this.stores.byId(parse(idSchema, id));
    const { version, ...input } = parse(settings, body);
    return this.finance.configure(id, version, input, req.actor!.id);
  }
  @Get("stores/:slug/checkout-policy") async checkout(
    @Param("slug") slug: string,
    @Req() req: AuthRequest,
  ) {
    return this.finance.policy(
      (await this.stores.owned(slug, req.actor!.id, "read")).id,
    );
  }
  @Put("stores/:slug/checkout-policy") async checkoutSave(
    @Param("slug") slug: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    const store = await this.stores.owned(
        slug,
        req.actor!.id,
        "settings-write",
      ),
      { version, ...input } = parse(
        settings.omit({ commissionBasisPoints: true }),
        body,
      ),
      previous = await this.finance.policy(store.id);
    return this.finance.configure(
      store.id,
      version,
      { ...input, commissionBasisPoints: previous.commissionBasisPoints },
      req.actor!.id,
    );
  }
  @Post("account/integration-jobs/:id/retry") async retry(
    @Param("id") id: string,
    @Req() req: AuthRequest,
  ) {
    const job = await this.jobs.get(parse(idSchema, id));
    if (job.ownerId !== req.actor!.id) throw notFound();
    if (job.scopeId === "platform")
      await this.users.requirePlatformAccess(
        req.actor!.id,
        "channel" in job.input && job.input.channel === "sms" ? "sms" : "email",
        true,
      );
    else if (job.scopeId.startsWith("contact:"))
      await this.users.requirePlatformAccess(req.actor!.id, "messages", true);
    else if (job.operation === "identity.phone-start") {
      const user = await this.users.findById(req.actor!.id);
      if (
        !user?.phone ||
        !("phone" in job.input) ||
        user.phone.replace(/[ ()-]/g, "") !== job.input.phone
      )
        throw notFound();
    } else if (["payment.create", "payment.refund"].includes(job.operation)) {
      // Original job owner may resume their immutable purchase/refund even without merchant membership.
      const user = await this.users.findById(req.actor!.id);
      if (!user || user.accountControl?.status === "paused") throw notFound();
    } else {
      let store = null;
      try {
        store = await this.stores.byId(job.scopeId);
      } catch (error) {
        if (!(error instanceof AppError) || error.status !== 404) throw error;
      }
      if (store)
        await this.stores.owned(
          store.slug,
          req.actor!.id,
          job.operation === "payout.create"
            ? "owner"
            : job.operation === "ai.generate"
              ? "catalog-write"
              : job.operation === "notification.send"
                ? "crm-write"
                : "orders-write",
        );
      else if (job.operation === "ai.generate")
        await this.partners.access(job.scopeId, req.actor!.id, "studio-write");
      else if (job.operation === "shipping.create")
        await this.partners.access(job.scopeId, req.actor!.id, "orders-write");
      else await this.partners.owner(job.scopeId, req.actor!.id);
    }
    const retried = await this.jobs.retry(job.id, req.actor!.id);
    return {
      id: retried.id,
      status: retried.status,
      attempts: retried.attempts,
    };
  }
  @Post("platform/integration-jobs/:id/retry")
  @UseGuards(PlatformGuard)
  @PlatformPermission("finance")
  async platformRetry(@Param("id") id: string) {
    const job = await this.jobs.get(parse(idSchema, id));
    if (
      ![
        "payment.create",
        "payment.refund",
        "payout.create",
        "shipping.create",
        "invoice.create",
        "invoice.credit",
      ].includes(job.operation)
    )
      throw notFound();
    const retried = await this.jobs.retry(job.id, job.ownerId);
    return {
      id: retried.id,
      status: retried.status,
      attempts: retried.attempts,
    };
  }

  @Post("wallet/:kind/:scope/bank/onboarding") async onboarding(
    @Param("kind") kind: string,
    @Param("scope") scope: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    return this.finance.onboarding(
      await this.scope(kind, scope, req),
      req.actor!.id,
      parse(z.object({ requestId: idSchema }).strict(), body).requestId,
    );
  }
}
