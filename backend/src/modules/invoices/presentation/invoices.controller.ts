import {
  Controller,
  Get,
  Post,
  Put,
  Req,
  Param,
  Body,
  UseGuards,
} from "@nestjs/common";
import { z } from "zod";
import { InvoicesService } from "../application/invoices.service";
import { StoresService } from "../../stores/application/stores.service";
import { SessionGuard } from "../../auth/presentation/session.guard";
import { parse, text, idSchema, ApiInput } from "../../../shared/validation";
import type { AuthRequest } from "../../../shared/http";
const seller = z
  .object({
    version: z.number().int().min(0),
    legalName: text(150).min(1),
    taxNumber: z.string().regex(/^(?:[0-9]{10}|[0-9]{11})$/),
    taxOffice: text(150).min(1),
    address: text(400).min(1),
    vatBasisPoints: z.number().int().min(0).max(10000),
  })
  .strict();
@Controller()
@UseGuards(SessionGuard)
export class InvoicesController {
  constructor(
    private readonly invoices: InvoicesService,
    private readonly stores: StoresService,
  ) {}
  @Get("stores/:slug/invoice-settings") async seller(
    @Param("slug") slug: string,
    @Req() req: AuthRequest,
  ) {
    return this.invoices.seller(
      (await this.stores.owned(slug, req.actor!.id)).id,
    );
  }
  @Put("stores/:slug/invoice-settings") @ApiInput(seller) async saveSeller(
    @Param("slug") slug: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    const { version, ...v } = parse(seller, body);
    return this.invoices.saveSeller(
      (await this.stores.owned(slug, req.actor!.id)).id,
      req.actor!.id,
      version,
      v,
    );
  }
  @Post("stores/:slug/orders/:id/invoice") async request(
    @Param("slug") slug: string,
    @Param("id") id: string,
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    return this.invoices.request(
      (await this.stores.owned(slug, req.actor!.id, "orders-write")).id,
      parse(idSchema, id),
      req.actor!.id,
      parse(z.object({ requestId: idSchema }).strict(), body).requestId,
    );
  }
  @Get("stores/:slug/orders/:id/invoice") async read(
    @Param("slug") slug: string,
    @Param("id") id: string,
    @Req() req: AuthRequest,
  ) {
    return this.invoices.order(
      (await this.stores.owned(slug, req.actor!.id, "orders-read")).id,
      parse(idSchema, id),
    );
  }
  @Get("public/stores/:slug/orders/:id/invoice") async buyer(
    @Param("slug") slug: string,
    @Param("id") id: string,
    @Req() req: AuthRequest,
  ) {
    return this.invoices.order(
      (await this.stores.bySlug(slug)).id,
      parse(idSchema, id),
      req.actor!.id,
    );
  }
}
