import { FinanceService } from "../../finance/application/finance.service";
import { IntegrationsService } from "../../integrations/application/integrations.service";
import { OrdersService } from "../../orders/application/orders.service";
import { CrmService } from "../../crm/application/crm.service";
import { Controller, Get, Param, Req, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { StoresService } from "../../stores/application/stores.service";
import { CatalogService } from "../../catalog/application/catalog.service";
import { SessionGuard } from "../../auth/presentation/session.guard";
import type { AuthRequest } from "../../../shared/http";
@ApiTags("dashboard")
@UseGuards(SessionGuard)
@Controller("stores/:slug/dashboard")
export class DashboardController {
  constructor(
    private readonly stores: StoresService,
    private readonly catalog: CatalogService,
    private readonly crm: CrmService,
    private readonly orders: OrdersService,
    private readonly finance: FinanceService,
    private readonly integrations: IntegrationsService,
  ) {}
  @Get() async summary(
    @Param("slug") slug: string,
    @Req() request: AuthRequest,
  ) {
    const store = await this.stores.owned(slug, request.actor!.id, "read");
    const list = await this.catalog.list(store.id, {
      q: "",
      category: "all",
      availability: "all",
      model: "all",
      status: "all",
      sort: "newest",
      page: 1,
      limit: 1,
    });
    return {
      inventory: { ...list.counts, categories: list.categories.length },
      sales: await this.orders.sales(store.id),
      orders: await this.orders.summary(store.id),
      finance:
        store.ownerId === request.actor!.id
          ? await this.finance.summary(store.id)
          : null,
      customers: {
        total: (
          await this.crm.list(store.id, {
            q: "",
            segment: "all",
            spend: "all",
            last: "all",
            page: 1,
            limit: 1,
          })
        ).total,
      },
      setup: {
        profile: !!store.name && !!store.company && !!store.bio,
        products: list.counts.live > 0,
        salesOpen: store.isOpen && store.mode === "normal",
      },
      unavailable: [
        ...(!this.integrations.status().configured
          ? ["payments", "shipping", "ai-studio", "notification-delivery"]
          : []),
        "custom-domain",
      ],
    };
  }
}
