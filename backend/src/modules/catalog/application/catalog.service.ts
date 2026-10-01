import { Inject, Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { CATALOG, type CatalogRepository } from "./catalog.repository";
import type { ProductInput, Product } from "../domain/product";
import type { ListQuery } from "../domain/list-query";
import { AppError, notFound, conflict } from "../../../shared/errors";
import { MediaService } from "../../media/application/media.service";
import {
  TRANSACTIONS,
  type TransactionRunner,
} from "../../../shared/transactions";
@Injectable()
export class CatalogService {
  constructor(
    @Inject(CATALOG) private readonly repository: CatalogRepository,
    private readonly media: MediaService,
    @Inject(TRANSACTIONS) private readonly tx: TransactionRunner,
  ) {}
  list(storeId: string, query: ListQuery, publicOnly = false) {
    return this.repository.list(storeId, query, publicOnly);
  }
  categories(storeId: string) {
    return this.repository.categories(storeId);
  }
  async addCategory(storeId: string, name: string) {
    return this.repository.ensureCategory(storeId, name);
  }
  async product(storeId: string, id: string) {
    const product = await this.repository.byId(storeId, id);
    if (!product) throw notFound();
    return product;
  }
  private async validate(storeId: string, input: ProductInput) {
    if (input.status === "live" && (!input.priceCents || !input.images.length))
      throw new AppError(
        422,
        "INCOMPLETE_PRODUCT",
        "Satış için fiyat ve en az bir görsel gerekir.",
      );
    await this.media.assertOwned(storeId, input.images, "product");
  }
  async create(storeId: string, input: ProductInput) {
    await this.validate(storeId, input);
    return this.tx.run(async () => {
      const category = await this.repository.ensureCategory(
        storeId,
        input.category,
      );
      const product: Product = {
        ...input,
        id: randomUUID(),
        storeId,
        category: category.name,
        categoryId: category.id,
        version: 0,
        createdAt: new Date(),
      };
      await this.repository.create(product);
      return product;
    });
  }
  async update(
    storeId: string,
    id: string,
    input: ProductInput,
    version: number,
  ) {
    await this.validate(storeId, input);
    return this.tx.run(async () => {
      const existing = await this.product(storeId, id);
      if (existing.version !== version) throw conflict();
      const category = await this.repository.ensureCategory(
        storeId,
        input.category,
      );
      const result = await this.repository.update(
        {
          ...existing,
          ...input,
          category: category.name,
          categoryId: category.id,
        },
        version,
      );
      if (!result) throw conflict();
      return result;
    });
  }
  async importSample(storeId: string, sampleId: string) {
    const samples: Record<
      string,
      { name: string; category: string; priceCents: number; costCents: number }
    > = {
      cardigan: {
        name: "Oversize Kaşmir Triko Hırka",
        category: "Giyim",
        priceCents: 69000,
        costCents: 24000,
      },
      serum: {
        name: "C Vitamini Serumu 30ml",
        category: "Bakım",
        priceCents: 34000,
        costCents: 8500,
      },
      "phone-stand": {
        name: "Meşe Telefon Standı",
        category: "Ev & Yaşam",
        priceCents: 38000,
        costCents: 12000,
      },
      cardholder: {
        name: "Minimalist Deri Kartlık",
        category: "Aksesuar",
        priceCents: 49000,
        costCents: 16000,
      },
    };
    const sample = samples[sampleId];
    if (!sample) throw notFound();
    return this.create(storeId, {
      ...sample,
      sku: `SAMPLE-${sampleId.toUpperCase()}`,
      barcode: "",
      currency: "TRY",
      stock: 0,
      variants: [],
      images: [`/dropshipping/${sampleId}.jpg`],
      status: "draft",
      model: "supplier",
      description:
        "Örnek katalog ürünü. Gerçek tedarikçi bağlantısı ve stok bulunmaz.",
      seoTitle: sample.name,
      seoDescription: "",
    });
  }
  async duplicate(storeId: string, id: string) {
    const source = await this.product(storeId, id);
    const {
      name,
      category,
      description,
      sku,
      barcode,
      priceCents,
      costCents,
      currency,
      stock,
      variants,
      images,
      model,
      seoTitle,
      seoDescription,
    } = source;
    return this.create(storeId, {
      name: `${name.slice(0, 111)} (Kopya)`,
      category,
      description,
      sku: `${sku.slice(0, 40)}-${randomUUID().slice(0, 8)}`,
      barcode,
      priceCents,
      costCents,
      currency,
      stock,
      variants,
      images,
      model,
      seoTitle,
      seoDescription,
      status: "draft",
    });
  }
  async adjustStock(storeId: string, id: string, amount: number) {
    const result = await this.repository.adjustStock(storeId, id, amount);
    if (!result) {
      await this.product(storeId, id);
      throw conflict("Stok yetersiz veya miktar sınırı aşıldı.");
    }
    return result;
  }
}
