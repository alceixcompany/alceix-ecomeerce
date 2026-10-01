import { before, after, test } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import type { INestApplication } from "@nestjs/common";
import type { Connection } from "mongoose";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
import sharp from "sharp";
import { createApp } from "../src/bootstrap";
import { loadConfig, type AppConfig } from "../src/config/config";
import { DATABASE } from "../src/infrastructure/database";
import { StoresService } from "../src/modules/stores/application/stores.service";
import { AuthService } from "../src/modules/auth/application/auth.service";
import { AppError } from "../src/shared/errors";
import { mongoFixture } from "./mongo-fixture";
const origin = "http://localhost:3000";
let app: INestApplication,
  fixture: Awaited<ReturnType<typeof mongoFixture>>,
  config: AppConfig,
  mediaDirectory: string;
let aliceCookie: string,
  bobCookie: string,
  slug: string,
  bobSlug: string,
  productId: string;
const baseProduct = {
  name: "Gerçek Ürün",
  category: "Giyim",
  description: "Test ürün açıklaması",
  sku: "TEST-001",
  barcode: "",
  priceCents: 1099,
  costCents: 400,
  currency: "TRY",
  stock: 10,
  variants: ["M", "L"],
  images: ["/dropshipping/cardigan.jpg"],
  status: "live",
  model: "own",
  seoTitle: "Gerçek Ürün",
  seoDescription: "",
};
const cookie = (response: request.Response) =>
  String(response.headers["set-cookie"][0]).split(";")[0];
function api() {
  return request(app.getHttpServer());
}
function admin(
  path: string,
  method: "get" | "post" | "put" = "get",
  body?: object,
  user = aliceCookie,
) {
  const operation = api()
    [method](`/api/v1/stores/${slug}${path}`)
    .set("Cookie", user)
    .set("Origin", origin);
  return body === undefined ? operation : operation.send(body);
}
before(async () => {
  fixture = await mongoFixture();
  mediaDirectory = await mkdtemp(join(tmpdir(), "alceix-media-"));
  config = loadConfig({
    NODE_ENV: "test",
    MONGODB_URI: fixture.uri,
    FRONTEND_ORIGIN: origin,
    MEDIA_DIRECTORY: mediaDirectory,
  });
  app = await createApp(config);
  const alice = await api()
    .post("/api/v1/auth/register")
    .set("Origin", origin)
    .send({
      name: "Alice Owner",
      store: "İpek Atölyesi",
      email: "alice@example.com",
      password: "password123",
    })
    .expect(201);
  aliceCookie = cookie(alice);
  slug = alice.body.stores[0].slug;
  const bob = await api()
    .post("/api/v1/auth/register")
    .set("Origin", origin)
    .send({
      name: "Bob Owner",
      store: "Başka Mağaza",
      email: "bob@example.com",
      password: "password123",
    })
    .expect(201);
  bobCookie = cookie(bob);
  bobSlug = bob.body.stores[0].slug;
});
after(async () => {
  await app?.close();
  await fixture?.cleanup();
  if (mediaDirectory)
    await rm(mediaDirectory, { recursive: true, force: true });
});
test("register creates persistent owned store and exposes no secrets", async () => {
  const me = await api()
    .get("/api/v1/auth/me")
    .set("Cookie", aliceCookie)
    .expect(200);
  assert.equal(me.body.user.email, "alice@example.com");
  assert.equal(me.body.stores[0].slug, slug);
  assert(!("passwordHash" in me.body.user));
  const store = await admin("").expect(200);
  assert.equal(store.body.isOpen, false);
  assert(!("ownerId" in store.body));
  await api().get("/api/v1/health/ready").expect(200);
  await api().get("/api/docs-json").expect(200);
});
test("invalid origins, missing sessions, wrong credentials and tenant access are rejected", async () => {
  await api()
    .post("/api/v1/auth/login")
    .set("Origin", "http://evil.example")
    .send({ email: "alice@example.com", password: "password123" })
    .expect(403);
  await api()
    .post("/api/v1/auth/login")
    .set("Origin", origin)
    .send({ email: "alice@example.com", password: "wrong" })
    .expect(401);
  await api().get(`/api/v1/stores/${slug}/products`).expect(401);
  await admin("/products", "get", undefined, bobCookie).expect(404);
});
test("email uniqueness and transactional registration rollback leave no orphan records", async () => {
  const db = app.get<Connection>(DATABASE);
  await api()
    .post("/api/v1/auth/register")
    .set("Origin", origin)
    .send({
      name: "Other User",
      store: "Duplicate",
      email: "ALICE@example.com",
      password: "password123",
    })
    .expect(409);
  assert.equal(await db.models.User.countDocuments(), 2);
  assert.equal(await db.models.Store.countDocuments(), 2);
  const stores = app.get(StoresService),
    original = stores.createOwned.bind(stores);
  stores.createOwned = async () => {
    throw new AppError(503, "TEST_FAILURE", "Test transaction failure");
  };
  try {
    await api()
      .post("/api/v1/auth/register")
      .set("Origin", origin)
      .send({
        name: "Failed User",
        store: "Rollback",
        email: "rollback@example.com",
        password: "password123",
      })
      .expect(503);
  } finally {
    stores.createOwned = original;
  }
  assert.equal(
    await db.models.User.countDocuments({ email: "rollback@example.com" }),
    0,
  );
});
test("admin product create feeds the public catalogue without cost or private fields", async () => {
  const result = await admin("/products", "post", baseProduct).expect(201);
  productId = result.body.id;
  const list = await api()
    .get(`/api/v1/public/stores/${slug}/products`)
    .expect(200);
  assert.equal(list.body.items[0].id, productId);
  assert.equal(list.body.items[0].priceCents, 1099);
  assert(!("costCents" in list.body.items[0]));
  assert(!("storeId" in list.body.items[0]));
  assert.equal(list.body.categoryCounts.Giyim, 1);
  await admin(`/products/${productId}`, "get", undefined, bobCookie).expect(
    404,
  );
});
test("drafts stay hidden; publication validation, SKU constraint and transaction rollback hold", async () => {
  await admin("/products", "post", {
    ...baseProduct,
    status: "live",
    images: [],
  }).expect(422);
  await admin("/products", "post", {
    ...baseProduct,
    sku: "test-001",
    category: "Must Roll Back",
  }).expect(409);
  const categories = await admin("/categories").expect(200);
  assert(
    !categories.body.some(
      (value: { name: string }) => value.name === "Must Roll Back",
    ),
  );
  const draft = await admin("/products", "post", {
    ...baseProduct,
    sku: "DRAFT",
    priceCents: 0,
    images: [],
    status: "draft",
  }).expect(201);
  await api()
    .get(`/api/v1/public/stores/${slug}/products/${draft.body.id}`)
    .expect(404);
  const list = await admin("/products?status=draft&limit=6").expect(200);
  assert.equal(list.body.total, 1);
  assert.equal(list.body.counts.all, 2);
  await admin("/products?limit=999").expect(422);
  const literal = await admin("/products?q=.*").expect(200);
  assert.equal(literal.body.total, 0);
});
test("optimistic updates reject stale changes; duplicates start as drafts", async () => {
  const current = await admin(`/products/${productId}`).expect(200);
  const changed = await admin(`/products/${productId}`, "put", {
    ...baseProduct,
    name: "Yeni Ürün Adı",
    version: current.body.version,
  }).expect(200);
  assert.equal(changed.body.version, current.body.version + 1);
  await admin(`/products/${productId}`, "put", {
    ...baseProduct,
    version: current.body.version,
  }).expect(409);
  const copy = await admin(`/products/${productId}/duplicate`, "post").expect(
    201,
  );
  assert.equal(copy.body.status, "draft");
  assert.notEqual(copy.body.id, productId);
  await api()
    .get(`/api/v1/public/stores/${slug}/products/${productId}`)
    .expect(200)
    .then((result) => assert.equal(result.body.name, "Yeni Ürün Adı"));
});
test("concurrent decrement of the last unit succeeds once and records one stock movement", async () => {
  const product = await admin("/products", "post", {
    ...baseProduct,
    sku: "LAST-UNIT",
    stock: 1,
  }).expect(201);
  const responses = await Promise.all([
    admin(`/products/${product.body.id}/stock`, "post", { amount: -1 }),
    admin(`/products/${product.body.id}/stock`, "post", { amount: -1 }),
  ]);
  assert.deepEqual(responses.map((result) => result.status).sort(), [201, 409]);
  const final = await admin(`/products/${product.body.id}`).expect(200);
  assert.equal(final.body.stock, 0);
  const db = app.get<Connection>(DATABASE);
  assert.equal(
    await db.models.StockMovement.countDocuments({
      productId: product.body.id,
      reason: "manual",
    }),
    1,
  );
});
test("settings drafts, saved profiles and reserved slugs are consistent", async () => {
  const store = await admin("").expect(200);
  const { id: _id, version, ...settings } = store.body;
  await admin("/settings/draft", "put", {
    ...settings,
    bio: "Taslak hikâye",
    version,
  }).expect(200);
  assert.equal(
    (await api().get(`/api/v1/public/stores/${slug}`).expect(200)).body.bio,
    "",
  );
  const draft = await admin("/settings/draft").expect(200);
  assert.equal(draft.body.settings.bio, "Taslak hikâye");
  await admin("/settings", "put", {
    ...settings,
    slug: "blog",
    version: draft.body.version,
  }).expect(409);
  await admin("/settings", "put", {
    ...settings,
    company: "İpek Ltd.",
    bio: "Gerçek mağaza hikâyesi",
    isOpen: true,
    version: draft.body.version,
  }).expect(200);
  const profile = await api().get(`/api/v1/public/stores/${slug}`).expect(200);
  assert.equal(profile.body.canPurchase, true);
  assert.equal(profile.body.bio, "Gerçek mağaza hikâyesi");
});
test("media checks file contents, owner and purpose, and can be fetched after storage", async () => {
  await admin("/media?kind=product", "post")
    .attach("file", Buffer.from("<script>bad</script>"), "fake.png")
    .expect(422);
  const png = await sharp({
    create: { width: 20, height: 20, channels: 3, background: "#123456" },
  })
    .png()
    .toBuffer();
  const media = await admin("/media?kind=product", "post")
    .attach("file", png, "real.png")
    .expect(201);
  await api()
    .get(media.body.url)
    .expect(200)
    .expect("Content-Type", /image\/webp/);
  await api()
    .post(`/api/v1/stores/${bobSlug}/products`)
    .set("Origin", origin)
    .set("Cookie", bobCookie)
    .send({ ...baseProduct, images: [media.body.url] })
    .expect(422);
  await admin("/products", "post", {
    ...baseProduct,
    sku: "MEDIA-PRODUCT",
    images: [media.body.url],
  }).expect(201);
});
test("guest cart is persistent, server-priced, versioned and respects store mode and stock", async () => {
  const guest = request.agent(app.getHttpServer());
  let result = await guest
    .get(`/api/v1/public/stores/${slug}/cart`)
    .expect(200);
  result = await guest
    .put(`/api/v1/public/stores/${slug}/cart`)
    .set("Origin", origin)
    .send({ version: result.body.version, lines: [{ productId, quantity: 2 }] })
    .expect(200);
  assert.equal(result.body.totalCents, 2198);
  assert.equal(result.body.reservesStock, false);
  await guest
    .put(`/api/v1/public/stores/${slug}/cart`)
    .set("Origin", origin)
    .send({ version: 0, lines: [] })
    .expect(409);
  await guest
    .put(`/api/v1/public/stores/${slug}/cart`)
    .set("Origin", origin)
    .send({
      version: result.body.version,
      lines: [{ productId, quantity: 99 }],
    })
    .expect(409);
  const loaded = await guest
    .get(`/api/v1/public/stores/${slug}/cart`)
    .expect(200);
  assert.equal(loaded.body.items[0].quantity, 2);
  const product = await admin(`/products/${productId}`).expect(200);
  await admin(`/products/${productId}`, "put", {
    ...baseProduct,
    priceCents: 2000,
    version: product.body.version,
  }).expect(200);
  assert.equal(
    (await guest.get(`/api/v1/public/stores/${slug}/cart`).expect(200)).body
      .totalCents,
    4000,
  );
  const profile = await admin("").expect(200);
  const { id: _id, version, ...settings } = profile.body;
  await admin("/settings", "put", {
    ...settings,
    mode: "maintenance",
    version,
  }).expect(200);
  assert.equal(
    (await guest.get(`/api/v1/public/stores/${slug}/cart`).expect(200)).body
      .valid,
    false,
  );
  await guest
    .put(`/api/v1/public/stores/${slug}/cart`)
    .set("Origin", origin)
    .send({ version: loaded.body.version, lines: [{ productId, quantity: 1 }] })
    .expect(409);
});
test("store following is authenticated, persistent and idempotent", async () => {
  const path = `/api/v1/public/stores/${slug}/follow`;
  await api().put(path).set("Origin", origin).expect(401);
  await api()
    .put(path)
    .set("Cookie", bobCookie)
    .set("Origin", origin)
    .expect(200);
  await api()
    .put(path)
    .set("Cookie", bobCookie)
    .set("Origin", origin)
    .expect(200);
  assert.equal(
    (await api().get(path).set("Cookie", bobCookie).expect(200)).body.followed,
    true,
  );
  await api()
    .delete(path)
    .set("Cookie", bobCookie)
    .set("Origin", origin)
    .expect(200);
  assert.equal(
    (await api().get(path).set("Cookie", bobCookie).expect(200)).body.followed,
    false,
  );
});
test("both application forms persist pending records without creating accounts", async () => {
  const db = app.get<Connection>(DATABASE),
    before = await db.models.User.countDocuments();
  const supplier = await api()
    .post("/api/v1/applications/supplier")
    .set("Origin", origin)
    .send({
      companyName: "Tedarik Ltd.",
      contact: "supplier@example.com",
      category: "Giyim",
      monthlyCapacity: "500-2000",
    })
    .expect(201);
  const influencer = await api()
    .post("/api/v1/applications/influencer")
    .set("Origin", origin)
    .send({
      name: "Creator Name",
      profile: "@creator",
      followers: "micro",
      category: "fashion",
      partnershipType: "affiliate",
    })
    .expect(201);
  assert.equal(supplier.body.status, "pending");
  assert.equal(influencer.body.status, "pending");
  assert.equal(await db.models.Application.countDocuments(), 2);
  assert.equal(await db.models.User.countDocuments(), before);
  await api()
    .post("/api/v1/applications/supplier")
    .set("Origin", origin)
    .send({ companyName: "Missing contact", category: "Giyim" })
    .expect(422);
});
test("sample catalogue import creates one explicit draft, not a live supplier connection", async () => {
  const sample = await admin("/sample-products", "post", {
    sampleId: "serum",
  }).expect(201);
  assert.equal(sample.body.status, "draft");
  assert.equal(sample.body.stock, 0);
  assert.equal(sample.body.model, "supplier");
  await admin("/sample-products", "post", { sampleId: "serum" }).expect(409);
  await api()
    .get(`/api/v1/public/stores/${slug}/products/${sample.body.id}`)
    .expect(404);
});
test("dashboard derives inventory and does not invent financial results", async () => {
  const summary = await admin("/dashboard").expect(200);
  const db = app.get<Connection>(DATABASE);
  const store = await db.models.Store.findOne({ slug });
  assert.equal(
    summary.body.inventory.all,
    await db.models.Product.countDocuments({ storeId: store.id }),
  );
  assert.equal(summary.body.finance, null);
  assert.equal(summary.body.sales, null);
});
test("password reset is one-time, revokes sessions, and unavailable SMTP is explicit", async () => {
  await api()
    .post("/api/v1/auth/forgot-password")
    .set("Origin", origin)
    .send({ email: "alice@example.com" })
    .expect(503);
  const db = app.get<Connection>(DATABASE);
  const bob = await db.models.User.findOne({ email: "bob@example.com" });
  const token = "a".repeat(64);
  const hash = createHash("sha256").update(token).digest("hex");
  await db.models.PasswordReset.create({
    hash,
    userId: bob.id,
    expiresAt: new Date(Date.now() + 60000),
  });
  await api()
    .post("/api/v1/auth/reset-password")
    .set("Origin", origin)
    .send({ token, password: "updated-password" })
    .expect(201);
  await api().get("/api/v1/auth/me").set("Cookie", bobCookie).expect(401);
  await api()
    .post("/api/v1/auth/reset-password")
    .set("Origin", origin)
    .send({ token, password: "another-password" })
    .expect(422);
  await api()
    .post("/api/v1/auth/login")
    .set("Origin", origin)
    .send({ email: "bob@example.com", password: "updated-password" })
    .expect(201);
  assert.equal(await app.get(AuthService).actor(bobCookie.split("=")[1]), null);
});
test("data and sessions survive application restart; logout revokes the session", async () => {
  await app.close();
  app = await createApp(config);
  const me = await api()
    .get("/api/v1/auth/me")
    .set("Cookie", aliceCookie)
    .expect(200);
  assert.equal(me.body.stores[0].slug, slug);
  assert.equal(
    (await admin(`/products/${productId}`).expect(200)).body.priceCents,
    2000,
  );
  await api()
    .post("/api/v1/auth/logout")
    .set("Origin", origin)
    .set("Cookie", aliceCookie)
    .expect(201);
  await api().get("/api/v1/auth/me").set("Cookie", aliceCookie).expect(401);
});

test("catalogue pages and combined filters keep correct scoped totals and public fields", async () => {
  const account = await api()
    .post("/api/v1/auth/register")
    .set("Origin", origin)
    .send({
      name: "Catalogue Owner",
      email: "catalogue@example.com",
      password: "password123",
      store: "Paged Catalogue",
    })
    .expect(201);
  const session = cookie(account),
    path = `/api/v1/stores/${account.body.stores[0].slug}`;
  for (let index = 0; index < 31; index++) {
    await api()
      .post(`${path}/products`)
      .set("Origin", origin)
      .set("Cookie", session)
      .send({
        ...baseProduct,
        sku: `PAGE-${index}`,
        name: `Page Product ${String(index).padStart(2, "0")}`,
        category: index % 2 ? "Bakım" : "Giyim",
        priceCents: (index + 1) * 100,
        stock: index < 10 ? 0 : 10,
        model: index % 2 ? "supplier" : "own",
        status: index === 30 ? "draft" : "live",
      })
      .expect(201);
  }
  const first = await api()
    .get(`${path}/products?limit=6&page=1&sort=price-asc`)
    .set("Cookie", session)
    .expect(200);
  const second = await api()
    .get(`${path}/products?limit=6&page=2&sort=price-asc`)
    .set("Cookie", session)
    .expect(200);
  assert.equal(first.body.total, 31);
  assert.equal(first.body.pageCount, 6);
  assert.equal(first.body.items.length, 6);
  assert(
    first.body.items.every(
      (item: { id: string }) =>
        !second.body.items.some((next: { id: string }) => next.id === item.id),
    ),
  );
  assert.equal(first.body.counts.critical, 10);
  assert.equal(first.body.counts.draft, 1);
  const combined = await api()
    .get(
      `${path}/products?category=Bak%C4%B1m&availability=in-stock&model=supplier&min=1200&max=2000&sort=price-asc`,
    )
    .set("Cookie", session)
    .expect(200);
  assert.equal(combined.body.total, 5);
  assert.deepEqual(
    combined.body.items.map((item: { priceCents: number }) => item.priceCents),
    [1200, 1400, 1600, 1800, 2000],
  );
  const publicPath = `/api/v1/public/stores/${account.body.stores[0].slug}/products`;
  const publicPage = await api()
    .get(`${publicPath}?limit=24&page=2&sort=price-asc`)
    .expect(200);
  assert.equal(publicPage.body.total, 30);
  assert.equal(publicPage.body.items.length, 6);
  assert.equal(publicPage.body.categoryCounts.Giyim, 15);
  for (const item of publicPage.body.items) {
    assert.equal(item.costCents, undefined);
    assert.equal(item.sku, undefined);
    assert.equal(item.storeId, undefined);
  }
  const stock = await api()
    .get(`${publicPath}?availability=out-of-stock&limit=24`)
    .expect(200);
  assert.equal(stock.body.total, 10);
  await api().get(`${publicPath}?min=2000&max=1000`).expect(422);
});
