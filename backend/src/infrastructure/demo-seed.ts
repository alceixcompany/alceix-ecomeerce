import type { INestApplication } from "@nestjs/common";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { AppConfig } from "../config/config";
import { AuthService } from "../modules/auth/application/auth.service";
import { UsersService } from "../modules/users/application/users.service";
import { StoresService } from "../modules/stores/application/stores.service";
import { settingsOf } from "../modules/stores/domain/store";
import { CatalogService } from "../modules/catalog/application/catalog.service";
import { MediaService } from "../modules/media/application/media.service";
import type { ListQuery } from "../modules/catalog/domain/list-query";

export const demoPassword = "AlceixDemo2026!";
export const demoAccounts = [
  {
    email: "demo@example.com",
    name: "Demo İşletmeci",
    store: "Luma Studio",
    slug: "luma-studio",
    count: 36,
  },
  {
    email: "nordik@example.com",
    name: "Nordik İşletmeci",
    store: "Nordik Demo",
    slug: "nordik-demo",
    count: 8,
  },
] as const;

// Public demo credentials may only be installed into an explicitly named local demo database.
export function assertDemoDatabase(config: AppConfig) {
  if (
    config.environment === "production" ||
    !/^mongodb:\/\/(?:127\.0\.0\.1|localhost):\d+\/alceix_demo(?:\?|$)/.test(
      config.mongoUri,
    )
  )
    throw new Error(
      "Demo seed requires a local alceix_demo database and a non-production environment.",
    );
}

const query: ListQuery = {
  q: "",
  category: "all",
  status: "all",
  sort: "newest",
  availability: "all",
  model: "all",
  page: 1,
  limit: 100,
};
const samples = [
  {
    image: "cardigan",
    name: "Kaşmir Triko Hırka",
    category: "Giyim",
    price: 69000,
  },
  {
    image: "serum",
    name: "C Vitamini Serumu 30ml",
    category: "Bakım",
    price: 34000,
  },
  {
    image: "phone-stand",
    name: "Meşe Telefon Standı",
    category: "Ev & Yaşam",
    price: 38000,
  },
  {
    image: "cardholder",
    name: "Minimalist Deri Kartlık",
    category: "Aksesuar",
    price: 49000,
  },
];

export async function seedDemo(
  app: INestApplication,
  config: AppConfig,
  assetsDirectory: string,
) {
  assertDemoDatabase(config);
  const auth = app.get(AuthService),
    users = app.get(UsersService),
    stores = app.get(StoresService),
    catalog = app.get(CatalogService),
    media = app.get(MediaService);
  const summary = [];
  for (const account of demoAccounts) {
    let user = await users.findByEmail(account.email);
    const created = !user;
    if (!user) {
      const registered = await auth.register({
        name: account.name,
        email: account.email,
        password: demoPassword,
        store: account.store,
      });
      await auth.logout(registered.token);
      user = await users.findByEmail(account.email);
    }
    if (!user) throw new Error("Demo account could not be created.");
    const owned = await stores.ownedBy(user.id);
    let store = created
      ? owned[0]
      : owned.find((item) => item.slug === account.slug);
    if (!store)
      throw new Error(
        `Existing account ${account.email} has no expected demo store; no existing settings were changed.`,
      );
    if (created) {
      const storeId = store.id;
      const upload = async (
        kind: "banner" | "logo" | "favicon",
        path: string,
      ) => {
        const buffer = await readFile(resolve(assetsDirectory, path));
        return (
          await media.upload(storeId, kind, { buffer, size: buffer.length })
        ).url;
      };
      store = await stores.save(
        store,
        {
          ...settingsOf(store),
          slug: account.slug,
          company: `${account.store} Demo İşletmesi`,
          bio: "Yerel demo mağazası. Ürün, stok, filtre, sepet ve yönetim akışlarını deneyebilirsiniz.",
          seoDescription: "Alceix yerel örnek mağazası",
          isOpen: true,
          bannerImage: await upload("banner", "dropshipping/store-knit.jpg"),
          logoImage: await upload("logo", "marketing/alceix-logo.webp"),
          faviconImage: await upload("favicon", "marketing/alceix-logo.webp"),
        },
        store.version,
        false,
      );
    }
    // Read all pages: a growing demo catalogue must not create duplicate SKUs on a rerun.
    const existingSkus = new Set<string>();
    for (let page = 1; ; page++) {
      const result = await catalog.list(store.id, { ...query, page });
      result.items.forEach((item) => existingSkus.add(item.sku));
      if (page >= result.pageCount) break;
    }
    let added = 0;
    for (let index = 0; index < account.count; index++) {
      const sku = `DEMO-${account.slug.toUpperCase()}-${String(index + 1).padStart(3, "0")}`;
      if (existingSkus.has(sku)) continue;
      const sample = samples[index % samples.length];
      const name = `${sample.name} ${String(index + 1).padStart(2, "0")}`;
      await catalog.create(store.id, {
        name,
        sku,
        category: sample.category,
        description:
          "Yerel örnek ürün. Gerçek sipariş veya tedarikçi bağlantısı içermez.",
        barcode: "",
        priceCents: sample.price + Math.floor(index / 4) * 2500,
        costCents: Math.floor(sample.price / 3),
        currency: "TRY",
        stock: index % 7 === 0 ? 0 : index % 5 === 0 ? 2 : 12 + index,
        variants: [],
        images: [
          `/dropshipping/${sample.image}.jpg`,
          `/storefront/gallery/${sample.image}-alternate.png`,
        ],
        status: index >= account.count - 4 ? "draft" : "live",
        model: index % 3 === 0 ? "supplier" : "own",
        seoTitle: name,
        seoDescription: "",
      });
      added++;
    }
    summary.push({
      email: account.email,
      slug: store.slug,
      added,
      counts: (await catalog.list(store.id, query)).counts,
    });
  }
  return summary;
}
