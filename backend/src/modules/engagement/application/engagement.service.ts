import { CrmService } from "../../crm/application/crm.service";
import {
  TRANSACTIONS,
  type TransactionRunner,
} from "../../../shared/transactions";
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
    private readonly crm: CrmService,
    @Inject(TRANSACTIONS) private readonly tx: TransactionRunner,
  ) {}
  async cart(hash: string, storeId: string) {
    return this.quote(await this.repository.cart(hash, storeId));
  }
  private async quote(cart: Cart) {
    const store = await this.stores.byId(cart.storeId),
      items = [],
      issues: string[] = [];
    if (!store.isOpen || store.mode !== "normal" || store.platformSuspended)
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
        const option = product.options?.find(
          (option) =>
            option.id === line.variant || option.name === line.variant,
        );
        if (
          line.variant &&
          (product.options?.length
            ? !option
            : !product.variants.includes(line.variant))
        )
          issues.push("Ürün varyantı artık geçerli değil.");
        if ((option?.stock ?? product.stock) < line.quantity)
          issues.push(`${product.name} için yeterli stok yok.`);
        items.push({
          productId: product.id,
          quantity: line.quantity,
          name: product.name,
          image: product.images[0] ?? "",
          variant: option?.name ?? line.variant ?? "",
          variantId: option?.id,
          requiresVariantSelection: !!product.variants.length && !line.variant,
          priceCents: option?.priceCents ?? product.priceCents,
          lineTotalCents:
            (option?.priceCents ?? product.priceCents) * line.quantity,
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
    identity?: { buyerId: string; email: string },
  ) {
    return this.tx.run(async () => {
      const current = await this.repository.cart(hash, storeId),
        quote = await this.quote({ ...current, lines });
      if (lines.length && !quote.valid)
        throw new AppError(409, "CART_UNAVAILABLE", quote.issues.join(" "));
      const cart = await this.repository.saveCart(
        hash,
        storeId,
        lines,
        version,
        identity,
      );
      if (!cart) throw conflict("Sepet değişti. Yenileyip tekrar deneyin.");
      await this.crm.clearCart(storeId, hash);
      if (
        identity &&
        lines.length &&
        !quote.items.some((item) => item.requiresVariantSelection)
      )
        await this.crm.recordCart(storeId, {
          hash,
          email: identity.email,
          buyerId: identity.buyerId,
          totalCents: quote.totalCents,
          updatedAt: new Date(),
          expiresAt: cart.expiresAt,
        });
      return this.quote(cart);
    });
  }

  followed(storeId: string, userId: string) {
    return this.repository.followed(storeId, userId);
  }
  follow(storeId: string, userId: string, enabled: boolean) {
    return this.repository.follow(storeId, userId, enabled);
  }
  rawCart(hash: string, storeId: string) {
    return this.repository.cart(hash, storeId);
  }
  async clear(hash: string, storeId: string, version: number) {
    if (!(await this.repository.saveCart(hash, storeId, [], version)))
      throw conflict("Sepet değişti; sipariş oluşturulmadı.");
    await this.crm.clearCart(storeId, hash);
  }
}
