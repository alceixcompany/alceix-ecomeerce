import { test, expect } from "@playwright/test";
import { randomUUID } from "node:crypto";
const origin = "http://localhost:3010";
test("committed support replies preserve other drafts and recover a failed draft refresh", async ({
  page,
}) => {
  const registered = await page.request.post("/api/v1/auth/register", {
    headers: { Origin: origin },
    data: {
      name: "Draft Recovery Owner",
      email: `draft-recovery-${randomUUID()}@example.com`,
      password: "Operations2026!",
      store: "Draft Recovery Store",
    },
  });
  expect(registered.ok()).toBeTruthy();
  const { stores } = await registered.json();
  const path = `/api/v1/stores/${stores[0].slug}/support`;
  const created = await page.request.post(path, {
    headers: { Origin: origin },
    data: {
      channel: "platform",
      category: "Diğer",
      priority: "normal",
      subject: "Draft refresh recovery",
      text: "Initial request",
    },
  });
  expect(created.ok()).toBeTruthy();
  const ticket = await created.json();
  const draftPath = `${path}/${ticket.id}/draft`;
  const persisted = await page.request.put(draftPath, {
    headers: { Origin: origin },
    data: { version: 0, text: "Different saved draft", attachments: [] },
  });
  expect(persisted.ok()).toBeTruthy();
  await page.goto(`/${stores[0].slug}/admin/destek?ticket=${ticket.id}`);
  const composer = page.getByLabel("Destek yanıtı");
  await expect(composer).toHaveValue("Different saved draft");
  await composer.fill("A separate reply");
  await page
    .getByRole("button", { name: "Yanıt Gönder", exact: false })
    .click();
  await expect(page.locator(".sd-messages")).toContainText("A separate reply");
  await expect(composer).toHaveValue("Different saved draft");
  await expect(composer).toBeEnabled();

  let failedReads = 0;
  await page.route(`**${draftPath}`, async (route) => {
    if (route.request().method() === "GET" && failedReads === 0) {
      failedReads++;
      await route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({ message: "Simulated draft read failure" }),
      });
    } else await route.continue();
  });
  await page
    .getByRole("button", { name: "Yanıt Gönder", exact: false })
    .click();
  await expect(page.locator(".ad-notice[role=status]")).toContainText(
    "Yanıt destek talebine kaydedildi",
  );
  await expect(composer).toHaveValue("");
  await expect(composer).toBeEnabled();
  await composer.fill("New draft after refresh failure");
  await page
    .getByRole("button", { name: "Taslağı Sakla", exact: true })
    .click();
  await expect(page.locator(".ad-notice[role=status]")).toContainText(
    "sunucuda saklandı",
  );
  await page.reload();
  await expect(composer).toHaveValue("New draft after refresh failure");
  const savedTicket = await page.request.get(`${path}/${ticket.id}`);
  expect(savedTicket.ok()).toBeTruthy();
  expect((await savedTicket.json()).messages).toHaveLength(3);
  expect(failedReads).toBe(1);
});
test("real profile, CRM and private support attachments persist across reloads", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const email = `operations-browser-${randomUUID()}@example.com`;
  const registered = await page.request.post("/api/v1/auth/register", {
    headers: { Origin: origin },
    data: {
      name: "Operations Owner",
      email,
      password: "Operations2026!",
      store: "Operations Browser Store",
    },
  });
  expect(registered.ok()).toBeTruthy();
  const { stores } = await registered.json();
  const base = `/${stores[0].slug}/admin`;
  await page.goto(`${base}/profil`);
  await expect(page.getByLabel("Ad Soyad", { exact: true })).toHaveValue(
    "Operations Owner",
  );
  await expect(page.getByLabel("E-posta", { exact: true })).toHaveAttribute(
    "readonly",
    "",
  );
  await page
    .getByLabel("Ad Soyad", { exact: true })
    .fill("Updated Operations Owner");
  await page.getByLabel("Şehir", { exact: true }).fill("İzmir");
  await page
    .getByRole("button", { name: "Profili Kaydet", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("Profiliniz kaydedildi");
  await page.reload();
  await expect(page.getByLabel("Ad Soyad", { exact: true })).toHaveValue(
    "Updated Operations Owner",
  );
  await page.goto(`${base}/musteriler`);
  await expect(
    page.getByRole("button", { name: "Yeni Müşteri Ekle", exact: true }),
  ).toBeEnabled();
  await page
    .getByRole("button", { name: "Yeni Müşteri Ekle", exact: true })
    .click();
  const crm = page.getByRole("dialog");
  await crm.getByLabel("Ad Soyad", { exact: true }).fill("Gerçek Müşteri");
  await crm
    .getByLabel("E-posta", { exact: true })
    .fill("real-customer@example.com");
  await crm.getByLabel("Şehir", { exact: true }).fill("Bursa");
  await crm.getByLabel("Pazarlama iletişim izni mevcut").check();
  await crm
    .getByRole("button", { name: "Müşteriyi Ekle", exact: true })
    .click();
  await expect(crm).not.toBeVisible();
  await expect(page.getByRole("table")).toContainText("Gerçek Müşteri");
  await page.reload();
  await expect(page.getByRole("table")).toContainText("Gerçek Müşteri");
  await page
    .getByRole("button", { name: "Toplu İletişim", exact: true })
    .click();
  await expect(crm.getByLabel("Kampanya Metni")).toBeEnabled();
  await crm.getByLabel("Hedef Segment").selectOption("all");
  await crm.getByLabel("Kampanya Metni").fill("MongoDB kampanya taslağı");
  await crm.getByRole("button", { name: "Kampanya Taslağını Kaydet" }).click();
  await expect(crm).not.toBeVisible();
  await page.reload();
  await page
    .getByRole("button", { name: "Toplu İletişim", exact: true })
    .click();
  await expect(crm.getByLabel("Kampanya Metni")).toHaveValue(
    "MongoDB kampanya taslağı",
  );
  await page.getByRole("button", { name: "CRM penceresini kapat" }).click();
  await page
    .getByRole("button", {
      name: "Toplu E-posta · Sepet Kurtarma",
      exact: true,
    })
    .click();
  const emailDialog = page.getByRole("dialog");
  await emailDialog.getByLabel("Alıcı segmenti").selectOption("all");
  await emailDialog
    .getByLabel("Konu", { exact: true })
    .fill("Kalıcı e-posta taslağı");
  await expect(
    emailDialog.getByRole("button", { name: "E-posta Taslağını Kaydet" }),
  ).toBeEnabled();
  await emailDialog
    .getByRole("button", { name: "E-posta Taslağını Kaydet" })
    .click();
  await expect(emailDialog.getByRole("status")).toContainText(
    "Gönderim yapılmadı",
  );
  await page.getByRole("button", { name: "E-posta penceresini kapat" }).click();
  await page.reload();
  await page
    .getByRole("button", {
      name: "Toplu E-posta · Sepet Kurtarma",
      exact: true,
    })
    .click();
  await expect(emailDialog.locator(".co-row")).toContainText(
    "Kalıcı e-posta taslağı",
  );
  await page.getByRole("button", { name: "E-posta penceresini kapat" }).click();
  await page.goto(`${base}/destek`);
  await expect(
    page.getByRole("button", {
      name: "Yeni Destek Talebi Oluştur",
      exact: true,
    }),
  ).toBeEnabled();
  await page
    .getByRole("button", { name: "Yeni Destek Talebi Oluştur", exact: true })
    .click();
  const support = page.getByRole("dialog");
  await support
    .getByLabel("Konu", { exact: true })
    .fill("Tarayıcıdan gerçek destek");
  await support
    .getByLabel("Açıklama", { exact: true })
    .fill("Dosya ve kalıcılık akışını kontrol etmek istiyorum.");
  await support
    .getByRole("button", { name: "Talebi Oluştur", exact: true })
    .click();
  await expect(support).not.toBeVisible();
  await expect(page.locator(".sd-conversation")).toContainText(
    "Tarayıcıdan gerçek destek",
  );
  await page
    .getByLabel("Destek yanıtı")
    .fill("Sunucuya kaydedilen gerçek yanıt");
  await page.locator("input[type=file]").setInputFiles({
    name: "support-note.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("Private browser attachment"),
  });
  await expect(page.locator(".sd-pending-files")).toContainText(
    "support-note.txt",
  );
  await page
    .getByRole("button", { name: "Yanıt Gönder", exact: false })
    .click();
  await expect(page.locator(".sd-messages")).toContainText(
    "Sunucuya kaydedilen gerçek yanıt",
  );
  await page.reload();
  await expect(page.locator(".sd-messages")).toContainText(
    "Sunucuya kaydedilen gerçek yanıt",
  );
  await page.getByLabel("Destek yanıtı").fill("MongoDB yanıt taslağı");
  await page
    .getByRole("button", { name: "Taslağı Sakla", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("sunucuda saklandı");
  await page.reload();
  await expect(page.getByLabel("Destek yanıtı")).toHaveValue(
    "MongoDB yanıt taslağı",
  );
  await page.getByLabel("Destek yanıtı").fill("");
  await page
    .getByRole("button", { name: "Taslağı Sakla", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("sunucuda saklandı");
  const downloadPromise = page.waitForEvent("download");
  await page.locator(".sd-messages .sd-attachment").click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("support-note.txt");
  await page
    .getByRole("button", { name: "Talebi Çözüldü Olarak Kapat", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Kapatmayı Onayla" })
    .click();
  await expect(
    page.getByRole("button", { name: "Talebi Tekrar Aç", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Talebi Tekrar Aç", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Talebi Tekrar Aç", exact: true })
    .click();
  await expect(page.getByLabel("Destek yanıtı")).toBeVisible();
  const ticketLink = page.url();
  for (let index = 0; index < 21; index++) {
    const response = await page.request.post(
      `${origin}/api/v1/stores/${stores[0].slug}/support`,
      {
        headers: { Origin: origin },
        data: {
          channel: "platform",
          category: "Diğer",
          subject: `Pagination ticket ${index}`,
          priority: "normal",
          text: "Sayfa dışındaki eski talep bağlantısını doğrulama.",
        },
      },
    );
    expect(response.ok()).toBeTruthy();
  }
  await page.goto(ticketLink);
  await expect(page.locator(".sd-conversation")).toContainText(
    "Tarayıcıdan gerçek destek",
  );
  await expect(page.locator(".sd-messages")).toContainText(
    "Sunucuya kaydedilen gerçek yanıt",
  );
  await page.screenshot({
    path: testInfo.outputPath("support-desktop.png"),
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: testInfo.outputPath("support-mobile.png"),
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  expect(errors).toEqual([]);
});
test("team invite acceptance grants only the assigned role and revocation removes access", async ({
  browser,
  page,
}) => {
  const ownerEmail = `team-owner-${randomUUID()}@example.com`,
    memberEmail = `team-member-${randomUUID()}@example.com`;
  const registered = await page.request.post("/api/v1/auth/register", {
    headers: { Origin: origin },
    data: {
      name: "Team Owner",
      email: ownerEmail,
      password: "Operations2026!",
      store: "Team Store",
    },
  });
  const { stores } = await registered.json();
  const base = `/${stores[0].slug}/admin`;
  await page.goto(`${base}/ekip`);
  await expect(
    page.getByRole("button", { name: "Davet Bağlantısı Hazırla" }),
  ).toBeEnabled();
  await page.getByLabel("E-posta adresi", { exact: true }).fill(memberEmail);
  await page
    .getByRole("combobox", { name: "Görev", exact: true })
    .selectOption("viewer");
  await page.getByRole("button", { name: "Davet Bağlantısı Hazırla" }).click();
  const link = page.getByLabel("Davet bağlantısı", { exact: true });
  await expect(link).toBeVisible();
  const invitation = await link.inputValue();
  const context = await browser.newContext();
  const member = await context.newPage();
  try {
    const response = await member.request.post(
      `${origin}/api/v1/auth/register`,
      {
        headers: { Origin: origin },
        data: {
          name: "Team Viewer",
          email: memberEmail,
          password: "Operations2026!",
          store: "Viewer Personal Store",
        },
      },
    );
    expect(response.ok()).toBeTruthy();
    await member.request.post(`${origin}/api/v1/auth/logout`, {
      headers: { Origin: origin },
    });
    await member.goto(invitation);
    await member
      .getByRole("button", { name: "Daveti Kabul Et", exact: true })
      .click();
    await member
      .locator(".auth-card")
      .getByRole("link", { name: "Giriş Yap", exact: true })
      .click();
    await member
      .getByLabel("E-posta Adresi", { exact: true })
      .fill(memberEmail);
    await member.getByLabel("Şifre", { exact: true }).fill("Operations2026!");
    await member
      .getByRole("button", { name: "Giriş Yap", exact: true })
      .click();
    await expect(member).toHaveURL(/ekip-daveti\?token=/);
    await member
      .getByRole("button", { name: "Daveti Kabul Et", exact: true })
      .click();
    await expect(
      member.getByRole("link", { name: "Mağaza Yönetimini Aç" }),
    ).toBeVisible();
    await member.getByRole("link", { name: "Mağaza Yönetimini Aç" }).click();
    await expect(member).toHaveURL(new RegExp(`${base}$`));
    const denied = await member.request.post(
      `${origin}/api/v1/stores/${stores[0].slug}/categories`,
      { headers: { Origin: origin }, data: { name: "Unauthorized" } },
    );
    expect(denied.status()).toBe(404);
    await page.reload();
    await expect(page.locator(".co-table")).toContainText("Team Viewer");
    await page
      .getByRole("button", { name: "Ekipten Kaldır", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Kaldırmayı Onayla", exact: true })
      .click();
    await expect(page.locator(".co-table")).not.toContainText(memberEmail);
    await member.reload();
    await expect(
      member.getByRole("heading", { name: "404", exact: true }),
    ).toBeVisible();
  } finally {
    await context.close();
  }
});
test("contact submission is persisted and recovery/configuration failures never show fake success", async ({
  page,
}) => {
  await page.goto("/iletisim");
  await page.getByLabel("Ad & Soyad").fill("Canlı İletişim");
  await page.locator("#contact-email").fill("contact-browser@example.com");
  await page
    .getByLabel("Mesajınız", { exact: false })
    .fill("İletişim talebimi gerçek veritabanına kaydetmek istiyorum.");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Mesajı Gönder" }).click();
  await expect(page.locator(".contact-prepared")).toContainText(
    "Mesajınız kaydedildi.",
  );
  await page.goto("/sifremi-unuttum");
  await page
    .getByLabel("E-posta Adresi", { exact: true })
    .fill("unknown@example.com");
  await page
    .getByRole("button", { name: "Şifre Yenileme Bağlantısı İste" })
    .click();
  await expect(page.locator(".auth-error")).toContainText("yapılandırılmadı");
  await expect(
    page.getByRole("heading", { name: "İsteğiniz alındı" }),
  ).not.toBeVisible();
  await page.goto("/sifre-sifirla?token=invalid");
  await expect(page.locator(".auth-error")).toContainText("Bağlantı geçersiz");
  await page.goto("/admin");
  await expect(page).toHaveURL(/giris-yap/);
  await page.goto("/tedarikci/modatekstil/admin");
  await expect(page).toHaveURL(/giris-yap/);
  await page.goto("/influencer/melis/admin");
  await expect(page).toHaveURL(/giris-yap/);
});

test("platform staff reply reaches the merchant and private attachments require a linked platform ticket", async ({
  browser,
  page,
}) => {
  const registered = await page.request.post("/api/v1/auth/register", {
    headers: { Origin: origin },
    data: {
      name: "Platform Support Merchant",
      email: `platform-support-${randomUUID()}@example.com`,
      password: "Operations2026!",
      store: "Platform Support Store",
    },
  });
  const { stores } = await registered.json(),
    slug = stores[0].slug;
  const response = await page.request.post(`/api/v1/stores/${slug}/support`, {
    headers: { Origin: origin },
    data: {
      channel: "platform",
      category: "Diğer",
      subject: "İki panel arasında gerçek destek",
      priority: "high",
      text: "Platform görevlisinin yanıtını bekliyorum.",
    },
  });
  expect(response.ok()).toBeTruthy();
  const ticket = await response.json();
  await page.goto(`/${slug}/admin/destek?channel=platform&ticket=${ticket.id}`);
  await expect(page.getByLabel("Destek yanıtı")).toBeVisible();
  await page.getByLabel("Destek yanıtı").fill("Özel belgeyi gönderiyorum.");
  await page.locator("input[type=file]").setInputFiles({
    name: "platform-document.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("Private platform document"),
  });
  await expect(page.locator(".sd-pending-files")).toContainText(
    "platform-document.txt",
  );
  await page
    .getByRole("button", { name: "Yanıt Gönder", exact: false })
    .click();
  await expect(page.locator(".sd-messages")).toContainText(
    "Özel belgeyi gönderiyorum.",
  );
  const context = await browser.newContext(),
    staff = await context.newPage();
  try {
    const login = await staff.request.post(`${origin}/api/v1/auth/login`, {
      headers: { Origin: origin },
      data: {
        email: "e2e-platform-staff@example.test",
        password: "E2ePlatform2026!",
      },
    });
    expect(login.ok()).toBeTruthy();
    await staff.goto(
      `${origin}/admin/destek?store=${stores[0].id}&ticket=${ticket.id}`,
    );
    await expect(
      staff.getByRole("log", { name: "Talep yazışmaları" }),
    ).toContainText("Özel belgeyi gönderiyorum.");
    const downloadPromise = staff.waitForEvent("download");
    await staff
      .getByRole("button", { name: "platform-document.txt ↓", exact: true })
      .click();
    expect((await downloadPromise).suggestedFilename()).toBe(
      "platform-document.txt",
    );
    await staff
      .getByLabel("Destek Yanıtı", { exact: true })
      .fill("Platform görevlisinin kalıcı yanıtı");
    await staff
      .getByRole("button", { name: "Yanıt & Durumu Kaydet", exact: true })
      .click();
    await expect(
      staff.getByRole("log", { name: "Talep yazışmaları" }),
    ).toContainText("Platform görevlisinin kalıcı yanıtı");
    await page.reload();
    await expect(page.locator(".sd-messages")).toContainText(
      "Platform görevlisinin kalıcı yanıtı",
    );
    await expect(page.locator(".sd-conversation")).toContainText(
      "Yanıt Bekliyor",
    );
  } finally {
    await context.close();
  }
});
