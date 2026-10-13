import sharp from "sharp";
import { before, after, test } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import {
  AUTH_REPOSITORY,
  type AuthRepository,
} from "../src/modules/auth/application/auth.repository";
import { randomBytes, createHash, randomUUID } from "node:crypto";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { INestApplication } from "@nestjs/common";
import type { Connection } from "mongoose";
import { createTestApp as createApp } from "./test-app";
import { loadConfig } from "../src/config/config";
import { DATABASE } from "../src/infrastructure/database";
import { StoresService } from "../src/modules/stores/application/stores.service";
import { OrdersService } from "../src/modules/orders/application/orders.service";
import { mongoFixture } from "./mongo-fixture";
let fixture: Awaited<ReturnType<typeof mongoFixture>>,
  app: INestApplication,
  directory: string,
  owner: string,
  buyer: string,
  other: string,
  slug: string;
const origin = "http://localhost:3000";
const api = () => request(app.getHttpServer());
const call = (
  method: "get" | "post" | "put",
  path: string,
  body?: object,
  cookie = owner,
) => {
  const req = api()
    [method](`/api/v1${path}`)
    .set("Origin", origin)
    .set("Cookie", cookie);
  return body === undefined ? req : req.send(body);
};
const path = (suffix = "") => `/stores/${slug}${suffix}`;
const contact = {
  customer: "Real Customer",
  city: "İzmir",
  address: "Gerçek teslimat adresi",
  carrier: "",
};
const input = (productId: string, quantity = 1) => ({
  ...contact,
  requestId: randomUUID(),
  lines: [{ productId, quantity, variant: "M" }],
});
async function product(stock = 1) {
  return (
    await call("post", path("/products"), {
      name: "Snapshot Product",
      category: "Giyim",
      description: "",
      sku: randomUUID(),
      barcode: "",
      priceCents: 12345,
      costCents: 3000,
      currency: "TRY",
      stock,
      variants: ["M"],
      images: ["/dropshipping/cardigan.jpg"],
      status: "live",
      model: "own",
      seoTitle: "",
      seoDescription: "",
    }).expect(201)
  ).body;
}
before(async () => {
  fixture = await mongoFixture();
  directory = await mkdtemp(join(tmpdir(), "alceix-commerce-"));
  app = await createApp(
    loadConfig({
      NODE_ENV: "test",
      MONGODB_URI: fixture.uri,
      FRONTEND_ORIGIN: origin,
      MEDIA_DIRECTORY: directory,
    }),
  );
  for (const kind of ["owner", "buyer", "other"]) {
    const registered = await api()
      .post("/api/v1/auth/register")
      .set("Origin", origin)
      .send({
        name: kind,
        email: `${kind}-commerce@example.com`,
        password: "Commerce2026!",
        ...(kind === "owner" ? { store: "Commerce Store" } : {}),
      })
      .expect(201);
    const cookie = String(registered.headers["set-cookie"][0]).split(";")[0];
    if (kind === "owner") {
      owner = cookie;
      slug = registered.body.stores[0].slug;
    } else if (kind === "buyer") {
      buyer = cookie;
      assert.equal(registered.body.stores.length, 0);
    } else other = cookie;
  }
  const settings = (await call("get", path())).body;
  const { id: _id, ...values } = settings;
  await call("put", path("/settings"), { ...values, isOpen: true }).expect(200);
});
after(async () => {
  await app?.close();
  await fixture?.cleanup();
  if (directory) await rm(directory, { recursive: true, force: true });
});

test("accounts can register without creating or acquiring a store", async () => {
  const me = await call("get", "/auth/me", undefined, buyer).expect(200);
  assert.deepEqual(me.body.stores, []);
  await call("get", path("/orders"), undefined, buyer).expect(404);
  await call("get", "/auth/platform-access", undefined, buyer).expect(404);
});
test("orders snapshot server prices, reserve stock, reject forged totals and replay without duplicate reservations", async () => {
  const p = await product(3),
    payload = input(p.id, 2);
  await call("post", path("/orders"), { ...payload, totalCents: 1 }).expect(
    422,
  );
  await call("post", path("/orders"), { ...payload, payment: "paid" }).expect(
    422,
  );
  const created = await call("post", path("/orders"), payload).expect(201);
  assert.equal(created.body.totalCents, 24690);
  assert.equal(created.body.payment, "pending");
  assert.equal(created.body.reservation, "held");
  assert.ok(!("initialInput" in created.body));
  assert.ok(!("createdBy" in created.body));
  const reserved = (await call("get", path(`/products/${p.id}`))).body;
  assert.equal(reserved.stock, 1);
  assert.equal(reserved.reservedStock, 2);
  const {
    id: _id,
    storeId: _store,
    categoryId: _cat,
    createdAt: _created,
    reservedStock: _reserved,
    ...values
  } = reserved;
  await call("put", path(`/products/${p.id}`), {
    ...values,
    priceCents: 54321,
  }).expect(200);
  const replay = await call("post", path("/orders"), payload).expect(201);
  assert.equal(replay.body.id, created.body.id);
  assert.equal(replay.body.totalCents, 24690);
  await call("post", path("/orders"), {
    ...payload,
    customer: "Different",
  }).expect(409);
  assert.equal((await call("get", path(`/products/${p.id}`))).body.stock, 1);
  await call("post", path(`/orders/${created.body.id}/cancel`), {
    version: 0,
  }).expect(201);
  await call("post", path(`/orders/${created.body.id}/cancel`), {
    version: 0,
  }).expect(201);
  const restored = (await call("get", path(`/products/${p.id}`))).body;
  assert.equal(restored.stock, 3);
  assert.equal(restored.reservedStock, 0);
});
test("concurrent last-stock orders allow only one reservation and concurrent same-key retry returns one order", async () => {
  const p = await product();
  const responses = await Promise.all([
    call("post", path("/orders"), input(p.id)),
    call("post", path("/orders"), input(p.id)),
  ]);
  assert.deepEqual(responses.map((r) => r.status).sort(), [201, 409]);
  const order = responses.find((r) => r.status === 201)!.body;
  await call("post", path(`/orders/${order.id}/cancel`), { version: 0 }).expect(
    201,
  );
  const key = input(p.id);
  const duplicates = await Promise.all([
    call("post", path("/orders"), key),
    call("post", path("/orders"), key),
  ]);
  assert.deepEqual(
    duplicates.map((r) => r.status),
    [201, 201],
  );
  assert.equal(duplicates[0].body.id, duplicates[1].body.id);
  assert.equal((await call("get", path(`/products/${p.id}`))).body.stock, 0);
});
test("multi-line failure rolls back all stock; invalid variants and foreign products cannot create orders", async () => {
  const p = await product(2),
    unavailable = await product(0);
  const before = (await call("get", path("/orders"))).body.total;
  await call("post", path("/orders"), {
    ...input(p.id),
    lines: [
      { productId: p.id, quantity: 1, variant: "M" },
      { productId: unavailable.id, quantity: 1, variant: "M" },
    ],
  }).expect(409);
  await call("post", path("/orders"), {
    ...input(p.id),
    lines: [{ productId: p.id, quantity: 1, variant: "Invalid" }],
  }).expect(409);
  await call("post", path("/orders"), input(randomUUID())).expect(409);
  assert.equal((await call("get", path(`/products/${p.id}`))).body.stock, 2);
  assert.equal((await call("get", path("/orders"))).body.total, before);
});
test("buyer reads and cancellations are account-scoped and never expose internal merchant notes", async () => {
  const p = await product(2),
    payload = input(p.id);
  const created = await call(
    "post",
    `/public/stores/${slug}/orders`,
    payload,
    buyer,
  ).expect(201);
  await call("put", path(`/orders/${created.body.id}`), {
    ...contact,
    internalNote: "Private",
    version: 0,
  }).expect(422);
  await call("put", path(`/orders/${created.body.id}`), {
    address: contact.address,
    city: contact.city,
    internalNote: "Private",
    version: 0,
  }).expect(200);
  const read = await call(
    "get",
    `/public/stores/${slug}/orders/${created.body.id}`,
    undefined,
    buyer,
  ).expect(200);
  assert.ok(!("internalNote" in read.body));
  const list = await call(
    "get",
    `/public/stores/${slug}/orders`,
    undefined,
    buyer,
  ).expect(200);
  assert.ok(list.body.items.every((item: object) => !("internalNote" in item)));
  await call(
    "get",
    `/public/stores/${slug}/orders/${created.body.id}`,
    undefined,
    other,
  ).expect(404);
  await call(
    "post",
    `/public/stores/${slug}/orders/${created.body.id}/cancel`,
    { version: 1 },
    other,
  ).expect(404);
  await call(
    "post",
    `/public/stores/${slug}/orders/${created.body.id}/cancel`,
    { version: 1 },
    buyer,
  ).expect(201);
});
test("expiry releases held stock once; stale edits and stock edits exceeding physical capacity are rejected", async () => {
  const p = await product(2),
    created = await call("post", path("/orders"), input(p.id)).expect(201);
  const held = (await call("get", path(`/products/${p.id}`))).body;
  const {
    id: _id,
    storeId: _store,
    categoryId: _cat,
    createdAt: _created,
    reservedStock: _reserved,
    ...values
  } = held;
  await call("put", path(`/products/${p.id}`), {
    ...values,
    stock: 9999999,
  }).expect(409);
  await app
    .get<Connection>(DATABASE)
    .model("Order")
    .updateOne(
      { id: created.body.id },
      { $set: { expiresAt: new Date(Date.now() - 1000) } },
    );
  await call("put", path(`/orders/${created.body.id}`), {
    address: "New",
    city: "New",
    internalNote: "",
    version: 0,
  }).expect(409);
  await app.get(OrdersService).expireReservations();
  await app.get(OrdersService).expireReservations();
  assert.equal((await call("get", path(`/products/${p.id}`))).body.stock, 2);
  const order = (await call("get", path(`/orders/${created.body.id}`))).body;
  assert.equal(order.shipment, "cancelled");
  assert.equal(order.cancellationReason, "expired");
  assert.equal(order.version, 1);
});

const design = () => ({
  announcement: { enabled: false, text: "", tone: "blue" },
  hero: {
    title: "Public hero",
    description: "",
    buttonLabel: "Ürünler",
    image: "/dropshipping/supplier-knit.jpg",
  },
  accent: "#0066ff",
  background: "white",
  font: "jakarta",
  sections: [
    {
      id: "hero",
      kind: "hero",
      title: "Manşet",
      description: "",
      visible: true,
      videoUrl: "",
    },
    {
      id: "products",
      kind: "products",
      title: "Ürünler",
      description: "",
      visible: true,
      videoUrl: "",
    },
  ],
});
test("design draft is private, published snapshot persists independently, and stale writes cannot overwrite it", async () => {
  const original = design();
  await call("get", path("/design"), undefined, buyer).expect(404);
  const first = await call("put", path("/design/draft"), {
    version: 0,
    design: original,
  }).expect(200);
  assert.equal(first.body.version, 1);
  assert.equal(
    (await call("get", `/public/stores/${slug}/design`, undefined, buyer)).body
      .design,
    null,
  );
  const published = await call("post", path("/design/publish"), {
    version: 1,
    design: original,
  }).expect(201);
  assert.equal(published.body.version, 2);
  const revised = {
    ...original,
    hero: { ...original.hero, title: "Private draft" },
  };
  await call("put", path("/design/draft"), {
    version: 2,
    design: revised,
  }).expect(200);
  await call("post", path("/design/publish"), {
    version: 2,
    design: revised,
  }).expect(409);
  const publicRead = (
    await call("get", `/public/stores/${slug}/design`, undefined, buyer)
  ).body;
  assert.equal(publicRead.design.hero.title, "Public hero");
  assert.ok(!("draft" in publicRead));
  assert.ok(!("storeId" in publicRead));
  assert.equal(
    (await call("get", path("/design"))).body.draft.hero.title,
    "Private draft",
  );
});
test("design rejects unowned media, duplicate sections, unsupported videos and nonfunctional product publication", async () => {
  const current = (await call("get", path("/design"))).body.version;
  const original = design(),
    write = (value: object) =>
      call("post", path("/design/publish"), {
        version: current,
        design: value,
      });
  await write({
    ...original,
    hero: { ...original.hero, image: `https://evil.example/image.jpg` },
  }).expect(422);
  await write({
    ...original,
    hero: { ...original.hero, image: `/api/v1/media/${randomUUID()}` },
  }).expect(422);
  await write({
    ...original,
    hero: { ...original.hero, image: "data:image/png;base64,AA==" },
  }).expect(422);
  await write({
    ...original,
    sections: [...original.sections, original.sections[0]],
  }).expect(422);
  await write({
    ...original,
    sections: original.sections.filter((s) => s.kind !== "products"),
  }).expect(422);
  await write({
    ...original,
    sections: [
      ...original.sections,
      {
        id: "video",
        kind: "video",
        title: "Video",
        description: "",
        visible: true,
        videoUrl: "http://youtube.com/watch?v=dQw4w9WgXcQ",
      },
    ],
  }).expect(422);
  await write({
    ...original,
    hero: { ...original.hero, image: "" },
    sections: [
      ...original.sections,
      {
        id: "video",
        kind: "video",
        title: "Video",
        description: "",
        visible: true,
        videoUrl: "https://youtu.be/dQw4w9WgXcQ",
      },
    ],
  }).expect(201);
});
test("concurrent design first writes and later edits preserve one versioned winner", async () => {
  const actor = (await call("get", "/auth/me")).body.user;
  const created = await app
    .get(StoresService)
    .createOwned(actor.id, "Concurrent Design Store");
  const base = `/stores/${created.slug}/design`;
  const first = await Promise.all([
    call("put", `${base}/draft`, { version: 0, design: design() }),
    call("put", `${base}/draft`, {
      version: 0,
      design: { ...design(), accent: "#333333" },
    }),
  ]);
  assert.deepEqual(first.map((r) => r.status).sort(), [200, 409]);
  const later = await Promise.all([
    call("put", `${base}/draft`, { version: 1, design: design() }),
    call("put", `${base}/draft`, {
      version: 1,
      design: { ...design(), accent: "#555555" },
    }),
  ]);
  assert.deepEqual(later.map((r) => r.status).sort(), [200, 409]);
  assert.equal((await call("get", base)).body.version, 2);
});
test("orders stay tenant-isolated with bounded stable pagination, filtering and read-only team capabilities", async () => {
  const p = await product(8);
  const orders = [];
  for (let index = 0; index < 7; index++)
    orders.push(
      (
        await call("post", path("/orders"), {
          ...input(p.id),
          customer: `Paged-${index}`,
        })
      ).body,
    );
  const first = (await call("get", path("/orders?q=Paged-&limit=3&page=1")))
    .body;
  const second = (await call("get", path("/orders?q=Paged-&limit=3&page=2")))
    .body;
  assert.equal(first.total, 7);
  assert.equal(first.pages, 3);
  assert.equal(second.items.length, 3);
  assert.ok(
    second.items.every(
      (item: { id: string }) =>
        !first.items.some(
          (previous: { id: string }) => previous.id === item.id,
        ),
    ),
  );
  await call("get", path("/orders?limit=101")).expect(422);
  assert.equal(
    (await call("get", path("/orders?tab=shipped"))).body.items.length,
    0,
  );
  const actor = (await call("get", "/auth/me")).body.user;
  const foreign = await app
    .get(StoresService)
    .createOwned(actor.id, "Foreign Order Store");
  await call("get", `/stores/${foreign.slug}/orders/${orders[0].id}`).expect(
    404,
  );
  const invitation = await call("post", path("/team/invitations"), {
    email: "buyer-commerce@example.com",
    role: "viewer",
  }).expect(201);
  await call(
    "post",
    "/team/accept",
    { token: invitation.body.token },
    buyer,
  ).expect(201);
  await call("get", path("/orders"), undefined, buyer).expect(200);
  await call("post", path("/orders"), input(p.id), buyer).expect(404);
  await call(
    "post",
    path(`/orders/${orders[0].id}/cancel`),
    { version: 0 },
    buyer,
  ).expect(404);
  await call(
    "put",
    path("/design/draft"),
    { version: 4, design: design() },
    buyer,
  ).expect(404);
});

test("design accepts only this store's compressed banner, never a product image or another store's banner", async () => {
  const image = await sharp({
    create: { width: 80, height: 40, channels: 3, background: "#ff2200" },
  })
    .jpeg()
    .toBuffer();
  const upload = async (storeSlug: string, kind: string) =>
    api()
      .post(`/api/v1/stores/${storeSlug}/media?kind=${kind}`)
      .set("Origin", origin)
      .set("Cookie", owner)
      .attach("file", image, {
        filename: "banner.jpg",
        contentType: "image/jpeg",
      })
      .expect(201);
  const banner = await upload(slug, "banner"),
    productImage = await upload(slug, "product");
  const otherStore = await app
    .get(StoresService)
    .createOwned(
      (await call("get", "/auth/me")).body.user.id,
      "Media Isolation Store",
    );
  const otherBanner = await upload(otherStore.slug, "banner");
  const version = (await call("get", path("/design"))).body.version;
  const payload = (url: string) => ({
    version,
    design: { ...design(), hero: { ...design().hero, image: url } },
  });
  await call(
    "post",
    path("/design/publish"),
    payload(productImage.body.url),
  ).expect(422);
  await call(
    "post",
    path("/design/publish"),
    payload(otherBanner.body.url),
  ).expect(422);
  await call("post", path("/design/publish"), payload(banner.body.url)).expect(
    201,
  );
  const content = await api().get(banner.body.url).expect(200);
  assert.equal(content.headers["content-type"], "image/webp");
  assert.equal(
    (await call("get", `/public/stores/${slug}/design`, undefined, buyer)).body
      .design.hero.image,
    banner.body.url,
  );
});

test("another store's live product cannot be reserved and dashboard matches actual order state", async () => {
  const actor = (await call("get", "/auth/me")).body.user;
  const foreign = await app
    .get(StoresService)
    .createOwned(actor.id, "Foreign Product Store");
  const payload = {
    name: "Foreign Live Product",
    category: "Giyim",
    description: "",
    sku: randomUUID(),
    barcode: "",
    priceCents: 12345,
    costCents: 0,
    currency: "TRY",
    stock: 3,
    variants: ["M"],
    images: ["/dropshipping/cardigan.jpg"],
    status: "live",
    model: "own",
    seoTitle: "",
    seoDescription: "",
  };
  const created = await call(
    "post",
    `/stores/${foreign.slug}/products`,
    payload,
  ).expect(201);
  await call("post", path("/orders"), input(created.body.id)).expect(409);
  assert.equal(
    (await call("get", `/stores/${foreign.slug}/products/${created.body.id}`))
      .body.stock,
    3,
  );
  const list = (await call("get", path("/orders"))).body;
  const summary = (await call("get", path("/dashboard"))).body;
  assert.equal(summary.orders.total, list.counts.all);
  assert.equal(summary.orders.pending, list.counts.preparing);
  assert.equal(summary.orders.cancelled, list.counts.cancelled);
  assert.equal(summary.sales.paidOrders, 0);
  assert.equal(summary.sales.paidCents, 0);
  assert.equal(summary.finance.availableCents, 0);
});

test("storeless accounts open stores idempotently and address defaults remain isolated and versioned", async () => {
  const requestId = randomUUID(),
    payload = { requestId, name: "Later Opened Store" };
  const created = await call("post", "/account/stores", payload, other).expect(
    201,
  );
  const replay = await call("post", "/account/stores", payload, other).expect(
    201,
  );
  assert.equal(replay.body.id, created.body.id);
  await call(
    "post",
    "/account/stores",
    { ...payload, name: "Different" },
    other,
  ).expect(409);
  const address = {
    title: "Ev",
    customer: "Actual Buyer",
    phone: "",
    city: "İzmir",
    address: "Gerçek adres",
    isDefault: true,
  };
  const first = await call("post", "/account/addresses", address, buyer).expect(
    201,
  );
  const second = await call(
    "post",
    "/account/addresses",
    { ...address, title: "İş" },
    buyer,
  ).expect(201);
  const addresses = (await call("get", "/account/addresses", undefined, buyer))
    .body;
  assert.equal(
    addresses.filter((a: { isDefault: boolean }) => a.isDefault).length,
    1,
  );
  assert.equal(
    (await call("get", "/account/addresses", undefined, other)).body.length,
    0,
  );
  await call(
    "put",
    `/account/addresses/${first.body.id}`,
    { ...address, version: 0 },
    buyer,
  ).expect(409);
  await call(
    "put",
    `/account/addresses/${second.body.id}`,
    { ...address, version: 0 },
    other,
  ).expect(404);
});
test("email verification is single-use, user-bound and fails explicitly without SMTP", async () => {
  await call("post", "/auth/email-verification", {}, buyer).expect(503);
  const user = (await call("get", "/auth/me", undefined, buyer)).body.user,
    token = randomBytes(32).toString("hex");
  await app.get<AuthRepository>(AUTH_REPOSITORY).saveVerification({
    hash: createHash("sha256").update(token).digest("hex"),
    userId: user.id,
    expiresAt: new Date(Date.now() + 60000),
  });
  await call("post", "/auth/verify-email", { token }, buyer).expect(201);
  await call("post", "/auth/verify-email", { token }, buyer).expect(422);
  assert.equal(
    (await call("get", "/auth/profile", undefined, buyer)).body.emailVerified,
    true,
  );
});
test("buyer support is visible only to that buyer and shop staff; attachment provenance cannot be forged", async () => {
  const ticket = await call(
    "post",
    `/public/stores/${slug}/support`,
    {
      category: "Diğer",
      subject: "Actual customer request",
      text: "Actual message",
    },
    buyer,
  ).expect(201);
  await call(
    "get",
    `/public/stores/${slug}/support/${ticket.body.id}`,
    undefined,
    other,
  ).expect(404);
  const upload = await api()
    .post(`/api/v1/public/stores/${slug}/support/attachments`)
    .set("Origin", origin)
    .set("Cookie", buyer)
    .attach("file", Buffer.from("Actual customer attachment"), {
      filename: "note.txt",
      contentType: "text/plain",
    })
    .expect(201);
  const messageId = randomUUID();
  await call(
    "post",
    `/public/stores/${slug}/support/${ticket.body.id}/replies`,
    {
      version: 0,
      messageId,
      text: "With attachment",
      attachments: [upload.body.id],
    },
    buyer,
  ).expect(201);
  await call(
    "get",
    `/public/stores/${slug}/support/${ticket.body.id}/attachments/${upload.body.id}`,
    undefined,
    buyer,
  ).expect(200);
  await call(
    "get",
    `/public/stores/${slug}/support/${ticket.body.id}/attachments/${upload.body.id}`,
    undefined,
    other,
  ).expect(404);
  const strangerUpload = await api()
    .post(`/api/v1/public/stores/${slug}/support/attachments`)
    .set("Origin", origin)
    .set("Cookie", other)
    .attach("file", Buffer.from("Different owner"), {
      filename: "note.txt",
      contentType: "text/plain",
    })
    .expect(201);
  await call(
    "post",
    `/public/stores/${slug}/support/${ticket.body.id}/replies`,
    {
      version: 1,
      messageId: randomUUID(),
      text: "Forged attachment",
      attachments: [strangerUpload.body.id],
    },
    buyer,
  ).expect(404);
  const merchantRead = await call(
    "get",
    path(`/support/${ticket.body.id}`),
  ).expect(200);
  assert.equal(merchantRead.body.messages[0].author, "customer");
});
