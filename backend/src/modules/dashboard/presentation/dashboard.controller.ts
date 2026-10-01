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
  ) {}
  @Get() async summary(
    @Param("slug") slug: string,
    @Req() request: AuthRequest,
  ) {
    const store = await this.stores.owned(slug, request.actor!.id);
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
      sales: null,
      orders: null,
      finance: null,
      customers: null,
      setup: {
        profile: !!store.name && !!store.company && !!store.bio,
        products: list.counts.live > 0,
        salesOpen: store.isOpen && store.mode === "normal",
      },
      unavailable: [
        "orders",
        "payments",
        "shipping",
        "finance",
        "crm",
        "support",
        "supplier-sync",
        "ai-studio",
        "notifications",
        "custom-domain",
      ],
    };
  }
}
