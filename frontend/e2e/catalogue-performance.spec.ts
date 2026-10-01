import { test, expect } from "@playwright/test";
import { randomUUID } from "node:crypto";
import { paginationPages } from "../src/lib/pagination";
import { catalogQuery } from "../src/modules/storefront/utils/catalog-query";

test("pagination stays bounded and query conversion preserves money/filter rules", () => {
  const pages = paginationPages(50000, 100000);
  expect(pages.filter((value) => value !== null)).toEqual([
    1, 49998, 49999, 50000, 50001, 50002, 100000,
  ]);
  expect(pages.length).toBeLessThanOrEqual(9);
  expect(paginationPages(1, 1)).toEqual([1]);
  const result = catalogQuery(
    new URLSearchParams("min=19.95&max=30&availability=in-stock&page=2"),
  );
  expect(result.query.get("min")).toBe("1995");
  expect(result.query.get("limit")).toBe("24");
  expect(result.query.get("availability")).toBe("in-stock");
  expect(catalogQuery(new URLSearchParams("min=50&max=10")).invalidRange).toBe(
    true,
  );
});

test("SSR catalogue, filtered pagination, debounced skeletons and admin stock filters", async ({
  page,
}, testInfo) => {
  const origin = "http://localhost:3010",
    email = `performance-${randomUUID()}@example.com`;
  const account = await page.request.post("/api/v1/auth/register", {
    headers: { Origin: origin },
    data: {
      name: "Catalogue Browser",
      email,
      password: "password123",
      store: "Performans Mağazası",
    },
  });
  expect(account.status()).toBe(201);
  const slug = (await account.json()).stores[0].slug;
  for (let index = 0; index < 36; index++) {
    const result = await page.request.post(`/api/v1/stores/${slug}/products`, {
      headers: { Origin: origin },
      data: {
        name: `Performans Ürünü ${String(index).padStart(2, "0")}`,
        category: index % 2 ? "Bakım" : "Giyim",
        description: "Gerçek sayfalanan ürün",
        sku: `LOAD-${index}`,
        barcode: "",
        priceCents: (index + 10) * 100,
        costCents: 500,
        currency: "TRY",
        stock: index < 12 ? 0 : 8,
        variants: [],
        images: ["/dropshipping/cardigan.jpg"],
        status: "live",
        model: index % 2 ? "supplier" : "own",
        seoTitle: "",
        seoDescription: "",
      },
    });
    expect(result.status()).toBe(201);
  }
  const productButtons = () =>
    page.getByRole("button", { name: /^Performans Ürünü \d\d$/ });
  const requests: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes(`/api/v1/public/stores/${slug}/products?`))
      requests.push(request.url());
  });
  const hydrated = page.waitForResponse((response) =>
    response.url().includes(`/api/v1/public/stores/${slug}/follow`),
  );
  await page.goto(`/${slug}`);
  await hydrated;
  await expect(productButtons()).toHaveCount(24);
  expect(requests).toHaveLength(0); // SSR batch is reused; hydration must not refetch it.
  await page
    .getByRole("navigation", { name: "Ürün sayfaları" })
    .getByRole("button", { name: "Sonraki" })
    .click();
  await expect(productButtons()).toHaveCount(12);
  await expect(page).toHaveURL(/page=2/);
  await page.getByRole("button", { name: /^Bakım/ }).click();
  await expect(productButtons()).toHaveCount(18);
  expect(new URL(page.url()).searchParams.has("page")).toBe(false);
  await page.getByLabel("Yalnızca stokta olanlar").check();
  await expect(productButtons()).toHaveCount(12);
  const before = requests.length;
  let release: (() => void) | undefined;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route(
    `**/api/v1/public/stores/${slug}/products?*`,
    async (route) => {
      await gate;
      await route.continue();
    },
  );
  const queried = page.waitForRequest(
    (request) =>
      request.url().includes(`/api/v1/public/stores/${slug}/products?`) &&
      new URL(request.url()).searchParams.get("q") === "Performans Ürünü 2",
  );
  const input = page.getByRole("searchbox", { name: "Mağazada ürün ara" });
  await input.fill("Perf");
  await input.fill("Performans");
  await input.fill("Performans Ürünü 2");
  await queried;
  await expect(
    page.getByRole("status", { name: "Ürünler yükleniyor" }),
  ).toBeVisible();
  const skeleton = page.locator(".sf-results .ui-skeleton").first();
  await expect(skeleton).toHaveCSS("animation-name", "catalog-shimmer");
  await expect(skeleton).toHaveCSS("background-image", /linear-gradient/);
  await page.screenshot({
    path: testInfo.outputPath("storefront-loading-desktop.png"),
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(skeleton).toHaveCSS("animation-name", "none");
  await page.screenshot({
    path: testInfo.outputPath("storefront-loading-mobile.png"),
    fullPage: true,
  });
  release?.();
  await expect(productButtons()).toHaveCount(5);
  expect(requests.length - before).toBe(1);
  await page.unroute(`**/api/v1/public/stores/${slug}/products?*`);
  await page.reload();
  await expect(productButtons()).toHaveCount(5);
  await page.getByRole("spinbutton", { name: "En çok ₺" }).fill("18");
  await expect(page.getByText("Bu seçime uygun ürün bulamadık.")).toBeVisible();
  await page.getByRole("button", { name: "Tüm ürünleri göster" }).click();
  await expect(productButtons()).toHaveCount(24);
  await page.route(`**/api/v1/public/stores/${slug}/products?*`, (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({
        code: "TEMPORARY_FAILURE",
        message: "Geçici katalog hatası",
      }),
    }),
  );
  await page
    .getByRole("searchbox", { name: "Mağazada ürün ara" })
    .fill("Sunucu hatası");
  await expect(page.locator(".sf-results").getByRole("alert")).toContainText("Geçici katalog hatası");
  await expect(
    page.getByRole("status", { name: "Ürünler yükleniyor" }),
  ).not.toBeVisible();
  await page.unroute(`**/api/v1/public/stores/${slug}/products?*`);
  await page.getByRole("button", { name: "Tekrar dene" }).click();
  await expect(page.getByText("Bu seçime uygun ürün bulamadık.")).toBeVisible();
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(`/${slug}/admin/urunler`);
  await expect(productButtons()).toHaveCount(6);
  const pagination = page.getByRole("navigation", { name: "Ürün sayfaları" });
  expect(await pagination.getByRole("button").count()).toBeLessThanOrEqual(9);
  await pagination.getByRole("button", { name: "Sonraki" }).click();
  await expect(page).toHaveURL(/page=2/);
  await expect(page.getByRole("table")).toHaveAttribute("aria-busy", "false");
  await page.getByRole("button", { name: "Filtrele & Dışa Aktar" }).click();
  await page
    .getByRole("combobox", { name: "Stok durumu", exact: true })
    .selectOption("out-of-stock");
  await page
    .getByRole("combobox", { name: "Satış modeli", exact: true })
    .selectOption("supplier");
  await expect(productButtons()).toHaveCount(6);
  await expect(
    pagination.getByRole("button", { name: "Sonraki" }),
  ).toBeDisabled();
  await expect(page.getByRole("table")).toHaveAttribute("aria-busy", "false");
  await page.screenshot({
    path: testInfo.outputPath("admin-filtered-catalogue.png"),
    fullPage: true,
  });
});
