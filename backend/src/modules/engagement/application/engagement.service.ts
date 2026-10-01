import { Inject, Injectable } from "@nestjs/common";
import {
  ENGAGEMENT,
  type EngagementRepository,
  type Cart,
  type CartLine,
} from "./engagement.repository";
import { CatalogService } from "../../catalog/application/catalog.service";
import { StoresService } from "../../stores/application/stores.service";
import { AppError, conflict } from "../../../shared/errors";
@Injectable()
export class EngagementService {
  constructor(
    @Inject(ENGAGEMENT) private readonly repository: EngagementRepository,
    private readonly catalog: CatalogService,
    private readonly stores: StoresService,
  ) {}
  async cart(hash: string, storeId: string) {
    return this.quote(await this.repository.cart(hash, storeId));
  }
  private async quote(cart: Cart) {
    const store = await this.stores.byId(cart.storeId),
      items = [],
      issues: string[] = [];
    if (!store.isOpen || store.mode !== "normal")
      issues.push("Mağaza şu anda satışa açık değil.");
    for (const line of cart.lines) {
      try {
        const product = await this.catalog.product(
          cart.storeId,
          line.productId,
        );
        if (product.status !== "live") {
          issues.push("Sepetteki bir ürün satıştan kaldırıldı.");
          continue;
        }
        if (product.stock < line.quantity)
          issues.push(`${product.name} için yeterli stok yok.`);
        items.push({
          productId: product.id,
          quantity: line.quantity,
          name: product.name,
          image: product.images[0] ?? "",
          priceCents: product.priceCents,
          lineTotalCents: product.priceCents * line.quantity,
        });
      } catch (error) {
        if (!(error instanceof AppError) || error.status !== 404) throw error;
        issues.push("Sepetteki bir ürün artık bulunamıyor.");
      }
    }
    return {
      lines: cart.lines,
      items,
      version: cart.version,
      totalCents: items.reduce((sum, item) => sum + item.lineTotalCents, 0),
      currency: "TRY",
      issues,
      valid: !issues.length,
      reservesStock: false,
    };
  }
  async saveCart(
    hash: string,
    storeId: string,
    lines: CartLine[],
    version: number,
  ) {
    const current = await this.repository.cart(hash, storeId),
      quote = await this.quote({ ...current, lines });
    if (lines.length && !quote.valid)
      throw new AppError(409, "CART_UNAVAILABLE", quote.issues.join(" "));
    const cart = await this.repository.saveCart(hash, storeId, lines, version);
    if (!cart) throw conflict("Sepet değişti. Yenileyip tekrar deneyin.");
    return this.quote(cart);
  }
  followed(storeId: string, userId: string) {
    return this.repository.followed(storeId, userId);
  }
  follow(storeId: string, userId: string, enabled: boolean) {
    return this.repository.follow(storeId, userId, enabled);
  }
}
