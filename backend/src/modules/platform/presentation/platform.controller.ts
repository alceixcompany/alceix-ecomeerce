import { OrdersService } from "../../orders/application/orders.service";
import { FinanceService } from "../../finance/application/finance.service";
import type { Response } from "express";
import {
  Controller,
  Get,
  Post,
  Put,
  Req,
  Query,
  Param,
  Body,
  UseGuards,
  Res,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { z } from "zod";
import { SessionGuard } from "../../auth/presentation/session.guard";
import {
  PlatformGuard,
  PlatformPermission,
} from "../../auth/presentation/platform.guard";
import { StoresService } from "../../stores/application/stores.service";
import { ApplicationsService } from "../../applications/application/applications.service";
import { ContactService } from "../../contact/application/contact.service";
import { SupportService } from "../../support/application/support.service";
import { ApiInput, parse, text, idSchema } from "../../../shared/validation";
import type { AuthRequest } from "../../../shared/http";
const pages = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  })
  .strict();
const reply = z
  .object({
    version: z.number().int().min(0),
    messageId: idSchema,
    text: text(4000).min(1),
  })
  .strict();
const status = z
  .object({
    version: z.number().int().min(0),
    status: z.enum(["open", "waiting", "resolved"]),
  })
  .strict();
@ApiTags("platform")
@Controller("platform")
@UseGuards(SessionGuard, PlatformGuard)
export class PlatformController {
  constructor(
    private readonly stores: StoresService,
    private readonly applications: ApplicationsService,
    private readonly contact: ContactService,
    private readonly support: SupportService,
    private readonly orders: OrdersService,
    private readonly finance: FinanceService,
  ) {}
  @Get("stores") @PlatformPermission("members") async storesList(
    @Query() query: unknown,
  ) {
    const input = parse(pages.extend({ q: text(120).default("") }), query);
    const result = await this.stores.adminList(
      input.q,
      input.page,
      input.limit,
    );
    return {
      ...result,
      items: result.items.map((store) => ({
        id: store.id,
        name: store.name,
        slug: store.slug,
        isOpen: store.isOpen,
        mode: store.mode,
      })),
    };
  }
  @Get("applications") @PlatformPermission("members") applicationsList(
    @Query() query: unknown,
  ) {
    const input = parse(pages, query);
    return this.applications.list(input.page, input.limit);
  }
  @Get("contacts") @PlatformPermission("messages") contacts(
    @Query() query: unknown,
  ) {
    const input = parse(pages, query);
    return this.contact.list(input.page, input.limit);
  }
  @Get("support") @PlatformPermission("support") supportList(
    @Query() query: unknown,
  ) {
    const input = parse(
      pages.extend({
        q: text(120).default(""),
        status: z.enum(["all", "open", "waiting", "resolved"]).default("all"),
        priority: z.enum(["all", "normal", "high"]).default("all"),
      }),
      query,
    );
    return this.support.platformList(input);
  }
  @Get("stores/:storeId/support/:id") @PlatformPermission("support") ticket(
    @Param("storeId") storeId: string,
    @Param("id") id: string,
  ) {
    return this.support.platformTicket(
      parse(idSchema, storeId),
      parse(idSchema, id),
    );
  }
  @Get("stores/:storeId/support/:id/attachments/:fileId")
  @PlatformPermission("support")
  async attachment(
    @Param("storeId") storeId: string,
    @Param("id") id: string,
    @Param("fileId") fileId: string,
    @Res() response: Response,
  ) {
    const { file, buffer } = await this.support.platformAttachment(
      parse(idSchema, storeId),
      parse(idSchema, id),
      parse(idSchema, fileId),
    );
    response
      .type("application/octet-stream")
      .set(
        "Content-Disposition",
        `attachment; filename="attachment"; filename*=UTF-8''${encodeURIComponent(file.name)}`,
      )
      .send(buffer);
  }
  @Get("stores/:storeId/support") @PlatformPermission("support") async tickets(
    @Param("storeId") id: string,
    @Query() query: unknown,
  ) {
    const input = parse(pages, query);
    const store = await this.stores.byId(parse(idSchema, id));
    return this.support.list(store.id, {
      ...input,
      channel: "platform",
      q: "",
      status: "all",
      priority: "all",
    });
  }
  @Post("stores/:storeId/support/:id/replies")
  @PlatformPermission("support")
  @ApiInput(reply)
  async reply(
    @Param("storeId") storeId: string,
    @Param("id") id: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    const store = await this.stores.byId(parse(idSchema, storeId));
    const input = parse(reply, body);
    const ticket = await this.support.platformTicket(
      store.id,
      parse(idSchema, id),
    );
    return this.support.reply(
      store.id,
      ticket.id,
      input.version,
      input.messageId,
      input.text,
      req.actor!,
      "support",
    );
  }
  @Put("stores/:storeId/support/:id/status")
  @PlatformPermission("support")
  @ApiInput(status)
  async status(
    @Param("storeId") storeId: string,
    @Param("id") id: string,
    @Body() body: unknown,
  ) {
    const store = await this.stores.byId(parse(idSchema, storeId));
    const input = parse(status, body);
    const ticket = await this.support.platformTicket(
      store.id,
      parse(idSchema, id),
    );
    return this.support.status(
      store.id,
      ticket.id,
      input.version,
      input.status,
    );
  }
  @Put("stores/:storeId/support/:id/review")
  @PlatformPermission("support")
  async review(
    @Param("storeId") storeId: string,
    @Param("id") id: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    const { version, ...input } = parse(
      z
        .object({
          version: z.number().int().min(0),
          assignedTo: z.union([z.literal(""), idSchema]),
          internalNote: text(2000),
          priority: z.enum(["normal", "high"]),
        })
        .strict(),
      body,
    );
    return this.support.review(
      parse(idSchema, storeId),
      parse(idSchema, id),
      req.actor!.id,
      version,
      input,
    );
  }

  @Put("contacts/:id/review")
  @PlatformPermission("messages")
  async contactReview(
    @Param("id") id: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    const v = parse(
      z
        .object({
          version: z.number().int().min(0),
          status: z.enum(["pending", "review", "resolved"]),
          internalNote: text(2000),
        })
        .strict(),
      body,
    );
    return this.contact.review(
      parse(idSchema, id),
      req.actor!.id,
      v.version,
      v.status,
      v.internalNote,
    );
  }
  @Post("contacts/:id/replies")
  @PlatformPermission("messages")
  async contactReply(
    @Param("id") id: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    const v = parse(
      z
        .object({
          requestId: idSchema,
          version: z.number().int().min(0),
          subject: text(200).min(1),
          message: text(4000).min(1),
        })
        .strict(),
      body,
    );
    return this.contact.reply(
      parse(idSchema, id),
      req.actor!.id,
      v.requestId,
      v.version,
      v.subject,
      v.message,
    );
  }
  @Get("sales/daily") @PlatformPermission("sales") dailySales(
    @Query() raw: unknown,
  ) {
    return this.orders.dailySales(
      undefined,
      parse(
        z
          .object({ days: z.coerce.number().int().min(1).max(90).default(30) })
          .strict(),
        raw,
      ).days,
    );
  }
  @Get("sales") @PlatformPermission("sales") sales() {
    return this.orders.sales();
  }
  @Get("orders") @PlatformPermission("sales") ordersList(
    @Query() raw: unknown,
  ) {
    return this.orders.platformList(
      parse(
        pages.extend({
          q: text(150).default(""),
          tab: z
            .enum([
              "all",
              "preparing",
              "shipped",
              "delivered",
              "cancelled",
              "requests",
            ])
            .default("all"),
          carrier: text(80).default("all"),
          period: z.enum(["all", "7", "30"]).default("all"),
        }),
        raw,
      ),
    );
  }
  @Get("finance/journal") @PlatformPermission("finance") journal(
    @Query() query: unknown,
  ) {
    return this.finance.journals(
      undefined,
      parse(pages.extend({ q: text(120).default("") }), query),
    );
  }
}
