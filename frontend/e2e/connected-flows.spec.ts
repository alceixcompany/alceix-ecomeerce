import { test, expect } from "@playwright/test";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
test("account, settings, products, media, storefront and cart work through the same-origin proxy", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const email = `browser-${randomUUID()}@example.com`;
  await page.goto("/kayit-ol");
  await page.getByLabel("Ad Soyad", { exact: true }).fill("Browser Owner");
  await page
    .getByLabel("Mağaza Adı", { exact: true })
    .fill("Tarayıcı Mağazası");
  await page.getByLabel("E-posta Adresi").fill(email);
  await page.getByLabel("Şifre", { exact: true }).fill("password123");
  await page.getByLabel("Şifre Tekrarı").fill("password123");
  await page.getByRole("button", { name: "Ücretsiz Hesap Oluştur" }).click();
  await expect(page).toHaveURL(/\/admin$/);
  let adminPath = new URL(page.url()).pathname;
  await expect(page.locator(".ad-chart-selected")).toContainText("—");
  await expect(page.locator(".ad-chart-selected")).not.toContainText("₺0");
  await page.getByRole("link", { name: "Mağaza Profili & Ayarlar" }).click();
  await expect(
    page.getByRole("heading", { name: "Mağaza Profili & Ayarlar" }),
  ).toBeVisible();
  await expect(page.locator("form.as-page")).not.toHaveAttribute("inert", "");
  await page.getByLabel("Resmi Şirket Unvanı").fill("Tarayıcı Ltd.");
  await page
    .getByLabel("Mağaza Biyografisi")
    .fill("API ile kaydedilen gerçek mağaza hikâyesi.");
  await page.getByRole("switch", { name: "Mağazayı satışa aç" }).click();
  await page
    .getByRole("button", { name: "Kaydet & Önizlemeyi Güncelle" })
    .click();
  await expect(page.getByRole("status")).toContainText(
    "Mağaza ayarları kaydedildi",
  );
  await page.getByRole("button", { name: "Bildirimi kapat" }).click();
  const oldStorePath = adminPath.replace(/\/admin$/, "");
  const nextSlug = `browser-renamed-${randomUUID().slice(0, 8)}`;
  await page.getByLabel("Özel Alceix Mağaza URL’si (Slug)").fill(nextSlug);
  await page.getByRole("button", { name: "Kaydet & Önizlemeyi Güncelle" }).click();
  await expect(page).toHaveURL(`/${nextSlug}/admin/ayarlar`);
  adminPath = `/${nextSlug}/admin`;
  await expect(page.getByLabel("Özel Alceix Mağaza URL’si (Slug)")).toHaveValue(nextSlug);
  const oldStoreResponse = await page.request.get(`/api/v1/public/stores${oldStorePath}`);
  expect(oldStoreResponse.status()).toBe(404);
  await page.getByRole("link", { name: "Ürün Yönetimi", exact: true }).click();
  await page.getByRole("button", { name: "Yeni Ürün Ekle" }).click();
  await page.getByLabel("Ürün Adı", { exact: false }).fill("Tarayıcı Ürünü");
  await page.getByLabel("SKU / Stok Kodu").fill("BROWSER-001");
  await page
    .locator("input[type=file]")
    .setInputFiles("public/dropshipping/cardigan.jpg");
  await expect(page.locator(".ap-editor-body")).not.toHaveAttribute(
    "inert",
    "",
  );
  await page
    .getByRole("button", { name: "Devam Et: Fiyat & Varyantlar" })
    .click();
  await page.getByLabel("Satış Fiyatı (TL)").fill("19,95");
  await page.getByLabel("Toplam Stok Adedi").fill("5");
  await page.getByRole("button", { name: "Devam Et: Vitrin Önizleme" }).click();
  await page.getByRole("button", { name: "Ürünü Mağazaya Ekle" }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(
    page.getByRole("button", { name: "Tarayıcı Ürünü", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Tarayıcı Ürünü", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Filtrele & Dışa Aktar" }).click();
  const csvPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "CSV İndir (1)" }).click();
  const csv = await csvPromise;
  const csvPath = await csv.path();
  expect(csvPath).not.toBeNull();
  const csvContents = await readFile(csvPath!, "utf8");
  expect(csvContents).toContain("Tarayıcı Ürünü");
  expect(csvContents).toContain("BROWSER-001");
  expect(csvContents.trim().split(/\r?\n/)).toHaveLength(2);
  await page.screenshot({
    path: testInfo.outputPath("admin-products.png"),
    fullPage: true,
  });
  await page.goto(adminPath.replace(/\/admin$/, ""));
  await expect(
    page
      .getByText("API ile kaydedilen gerçek mağaza hikâyesi.", { exact: true })
      .first(),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Tarayıcı Ürünü", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Tarayıcı Ürünü sepete ekle" })
    .click();
  await expect(page.getByRole("status").first()).toContainText(
    "sepetinize eklendi",
  );
  await page.reload();
  await page.getByRole("button", { name: /Sepeti aç/ }).click();
  await expect(page.getByRole("dialog")).toContainText("Tarayıcı Ürünü");
  await expect(page.getByRole("dialog")).toContainText("19,95");
  await page
    .getByRole("button", { name: "Pencereyi kapat", exact: true })
    .click();
  await page.getByRole("button", { name: "Mağazayı takip et" }).click();
  await expect(
    page
      .getByRole("region", { name: "Mağaza bilgileri" })
      .getByRole("button", { name: "Takip ediliyor" }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page
      .getByRole("region", { name: "Mağaza bilgileri" })
      .getByRole("button", { name: "Takip ediliyor" }),
  ).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: testInfo.outputPath("storefront-mobile.png"),
    fullPage: true,
  });
  expect(errors).toEqual([]);
});
test("public forms send both compact and dedicated applications; admin routes require sign-in", async ({
  page,
}) => {
  await page.goto("/tedarikci-ol");
  await page.locator("#companyName").fill("Browser Supplier");
  await page.locator("#contactName").fill("Supplier Owner");
  await page.locator("#contactPhone").fill("05321234567");
  await page.locator("#contactEmail").fill("supplier@example.com");
  await page.locator("#category").selectOption("moda");
  await page.locator("#skuCount").selectOption("100-500");
  await page.locator("#dailyCapacity").selectOption("50-200");
  await page
    .getByRole("button", { name: /Başvur/ })
    .last()
    .click();
  await expect(page.getByRole("status")).toContainText("Başvurunuz alındı");
  await page.goto("/influencer-ol");
  await page.locator("#influencer-field-0").fill("Browser Creator");
  await page.locator("#influencer-field-1").fill("05321234567");
  await page.locator("#influencer-field-2").fill("creator@example.com");
  await page.locator("#influencer-field-4").fill("@browser");
  await page
    .getByRole("button", { name: "Influencer Başvurusunu Gönder" })
    .click();
  await expect(page.getByRole("status")).toContainText("Başvurunuz alındı");
  await page.goto("/");
  const supplier = page
    .locator("form")
    .filter({ has: page.locator("#application-1-1") });
  await supplier.locator("#application-1-1").fill("Compact Supplier");
  await supplier.locator("#application-1-4").fill("compact@example.com");
  await supplier.getByRole("button", { name: /Başvur/ }).click();
  await expect(supplier.getByRole("status")).toContainText("Başvurunuz alındı");
  const influencer = page
    .locator("form")
    .filter({ has: page.locator("#application-0-1") });
  await influencer.locator("#application-0-1").fill("Compact Creator");
  await influencer.locator("#application-0-4").fill("@compact");
  await influencer.getByRole("button", { name: /Başvur/ }).click();
  await expect(influencer.getByRole("status")).toContainText(
    "Başvurunuz alındı",
  );
  await page.goto("/unknown-store/admin");
  await expect(page).toHaveURL(/\/giris-yap\?next=/);
});
