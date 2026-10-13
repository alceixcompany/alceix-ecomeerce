import sharp from "sharp";
import { MediaService } from "../src/modules/media/application/media.service";
import { AttachmentsService } from "../src/modules/support/application/attachments.service";
import { NotificationsService } from "../src/modules/notifications/application/notifications.service";
import { CrmService } from "../src/modules/crm/application/crm.service";
import { RateLimiter } from "../src/infrastructure/rate-limiter";
import { before, after, test } from "node:test";
import assert from "node:assert/strict";
import { createServer, type Server } from "node:http";
import request from "supertest";
import { randomUUID, createHmac } from "node:crypto";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { INestApplication } from "@nestjs/common";
import type { Connection } from "mongoose";
import { createTestApp as createApp } from "./test-app";
import { loadConfig } from "../src/config/config";
import { DATABASE } from "../src/infrastructure/database";
import { UsersService } from "../src/modules/users/application/users.service";
import { JobsService } from "../src/modules/jobs/application/jobs.service";
import { CommerceService } from "../src/modules/commerce/application/commerce.service";
import { mongoFixture } from "./mongo-fixture";
let fixture: Awaited<ReturnType<typeof mongoFixture>>,
  app: INestApplication,
  directory: string,
  gateway: Server;
const origin = "http://localhost:3000",
  secret = "test-webhook-secret-32-characters-minimum",
  token = "test-gateway-token-32-characters-minimum",
  accounts: Record<string, { cookie: string; id: string }> = {},
  pulledEvents = new Map<string, object[]>(),
  requests = new Map<string, { input: string; calls: number }>();
let slug: string,
  storeId: string,
  productId: string,
  orderId: string,
  paymentId: string,
  shipmentId: string;
const api = () => request(app.getHttpServer());
const call = (
  who: string,
  method: "get" | "post" | "put",
  path: string,
  body?: object,
) => {
  const req = api()
    [method](`/api/v1${path}`)
    .set("Origin", origin)
    .set("Cookie", accounts[who].cookie);
  return body === undefined ? req : req.send(body);
};
const path = (suffix: string) => `/stores/${slug}${suffix}`;
async function dispatch(id: string) {
  const db = app.get<Connection>(DATABASE);
  for (let attempt = 0; attempt < 8; attempt++) {
    const job = await db.models.IntegrationJob.findOne({ id }).lean();
    if (job && job.status === "awaiting") return;
    await db.models.IntegrationJob.updateOne(
      { id, status: "queued" },
      { $set: { availableAt: new Date(0) } },
    );
    await app.get(JobsService).runOnce(id);
  }
  assert.fail("Integration job did not dispatch");
}
const event = (
  referenceId: string,
  kind: string,
  amountCents: number,
  extra: object = {},
) => ({
  eventId: randomUUID(),
  referenceId,
  kind,
  amountCents,
  currency: "TRY",
  ...extra,
});
function callback(body: object, signed = true) {
  const raw = JSON.stringify(body),
    timestamp = String(Math.floor(Date.now() / 1000)),
    signature = createHmac("sha256", secret)
      .update(timestamp + "." + raw)
      .digest("hex");
  return api()
    .post("/api/v1/integrations/events")
    .set("Content-Type", "application/json")
    .set("X-Alceix-Timestamp", timestamp)
    .set("X-Alceix-Signature", signed ? signature : "0".repeat(64))
    .send(raw);
}
before(async () => {
  const image = await sharp({
    create: { width: 64, height: 64, channels: 3, background: "#abc123" },
  })
    .png()
    .toBuffer();
  gateway = createServer(async (req, res) => {
    let content = "";
    for await (const chunk of req) content += chunk.toString();
    if (req.headers.authorization !== `Bearer ${token}`) {
      res.writeHead(401);
      res.end();
      return;
    }
    if (
      req.method === "GET" &&
      /^\/v1\/results\/[a-f0-9-]+\/images\/0$/.test(req.url ?? "")
    ) {
      res.setHeader("Content-Type", "image/png");
      res.end(image);
      return;
    }
    if (req.url === "/v1/events.pull") {
      const input = JSON.parse(content),
        timestamp = String(Math.floor(Date.now() / 1000));
      const events = (pulledEvents.get(input.referenceId) ?? []).map((body) => {
        const payload = JSON.stringify(body);
        return {
          payload,
          timestamp,
          signature: createHmac("sha256", secret)
            .update(timestamp + "." + payload)
            .digest("hex"),
        };
      });
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ events }));
      return;
    }
    const input = JSON.parse(content),
      key = String(req.headers["idempotency-key"]),
      previous = requests.get(key);
    if (previous && previous.input !== content) {
      res.writeHead(409);
      res.end();
      return;
    }
    requests.set(key, { input: content, calls: (previous?.calls ?? 0) + 1 });
    const operation = req.url?.slice(4);
    const response =
      operation === "identity.phone-start"
        ? {
            providerReference: `phone-${input.referenceId}`,
            expiresAt: new Date(Date.now() + 300000).toISOString(),
          }
        : operation === "identity.phone-verify"
          ? { verified: input.code === "123456" }
          : operation?.endsWith(".cancel")
            ? { cancelled: true }
            : operation === "payment.create"
              ? {
                  providerReference: `provider-${input.referenceId}`,
                  checkoutUrl: `https://provider.example/checkout/${input.referenceId}`,
                }
              : operation === "shipping.create"
                ? {
                    providerReference: `shipment-${input.referenceId}`,
                    tracking: "REAL-TRACKING",
                    labelUrl: "https://provider.example/label.pdf",
                  }
                : operation === "identity.verify"
                  ? {
                      bankReference: "verified-bank-reference",
                      verified: true,
                      actorId: input.actorId,
                      scopeId: input.scopeId,
                      holderName: input.owner,
                    }
                  : operation === "shipping.quote"
                    ? {
                        carrier: "Actual Carrier",
                        amountCents: 1500,
                        expiresAt: new Date(Date.now() + 60000).toISOString(),
                      }
                    : { providerReference: `provider-${input.referenceId}` };
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(response));
  });
  await new Promise<void>((resolve) => gateway.listen(0, "127.0.0.1", resolve));
  const address = gateway.address();
  assert.ok(address && typeof address !== "string");
  fixture = await mongoFixture();
  directory = await mkdtemp(join(tmpdir(), "alceix-settlement-"));
  app = await createApp(
    loadConfig({
      NODE_ENV: "test",
      MONGODB_URI: fixture.uri,
      FRONTEND_ORIGIN: origin,
      MEDIA_DIRECTORY: directory,
      COMMERCE_GATEWAY_URL: `http://127.0.0.1:${address.port}`,
      COMMERCE_GATEWAY_TOKEN: token,
      COMMERCE_WEBHOOK_SECRET: secret,
    }),
  );
  for (const who of ["owner", "buyer", "outsider"]) {
    const registered = await api()
      .post("/api/v1/auth/register")
      .set("Origin", origin)
      .send({
        name: who,
        email: `${who}-settlement@example.com`,
        password: "Settlement2026!",
        ...(who === "owner" ? { store: "Settlement Store" } : {}),
      })
      .expect(201);
    accounts[who] = {
      cookie: String(registered.headers["set-cookie"][0]).split(";")[0],
      id: registered.body.user.id,
    };
    if (who === "owner") slug = registered.body.stores[0].slug;
  }
  await app.get(UsersService).setPlatformAdmin(accounts.owner.id, true);
  const settings = (await call("owner", "get", path(""))).body;
  storeId = settings.id;
  const { id: _id, ...values } = settings;
  await call("owner", "put", path("/settings"), {
    ...values,
    isOpen: true,
  }).expect(200);
  const product = await call("owner", "post", path("/products"), {
    name: "Actual Paid Product",
    category: "Giyim",
    description: "",
    sku: randomUUID(),
    barcode: "",
    priceCents: 10000,
    costCents: 3000,
    currency: "TRY",
    stock: 20,
    variants: [],
    images: ["/dropshipping/cardigan.jpg"],
    status: "live",
    model: "own",
    seoTitle: "",
    seoDescription: "",
  }).expect(201);
  productId = product.body.id;
  const created = await call("buyer", "post", `/public/stores/${slug}/orders`, {
    requestId: randomUUID(),
    customer: "Actual Buyer",
    email: "buyer-settlement@example.com",
    city: "İzmir",
    address: "Gerçek adres",
    lines: [{ productId, quantity: 2, variant: "" }],
  }).expect(201);
  orderId = created.body.id;
});
after(async () => {
  await app?.close();
  await fixture?.cleanup();
  if (directory) await rm(directory, { recursive: true, force: true });
  await new Promise<void>((resolve) => gateway?.close(() => resolve()));
});
test("unconfigured business policy blocks payment and unsigned events never change an order", async () => {
  await call(
    "buyer",
    "post",
    `/public/stores/${slug}/orders/${orderId}/payment`,
    { requestId: randomUUID() },
  ).expect(503);
  await callback(event(randomUUID(), "payment.captured", 21500), false).expect(
    403,
  );
  assert.equal(
    (await call("owner", "get", path(`/orders/${orderId}`))).body.payment,
    "pending",
  );
  await call("outsider", "put", `/platform/stores/${storeId}/commerce-policy`, {
    version: 0,
    commissionBasisPoints: 250,
    returnDays: 30,
    shippingMode: "fixed",
    fixedShippingCents: 1500,
  }).expect(404);
  await call("owner", "put", `/platform/stores/${storeId}/commerce-policy`, {
    version: 0,
    commissionBasisPoints: 250,
    returnDays: 30,
    shippingMode: "fixed",
    fixedShippingCents: 1500,
  }).expect(200);
});
test("payment preparation prices shipping on the server, freezes the quote and dispatches one idempotent job", async () => {
  paymentId = randomUUID();
  const created = await call(
    "buyer",
    "post",
    `/public/stores/${slug}/orders/${orderId}/payment`,
    { requestId: paymentId },
  ).expect(201);
  assert.equal(created.body.amountCents, 21500);
  assert.equal(created.body.checkoutUrl, null);
  const replay = await call(
    "buyer",
    "post",
    `/public/stores/${slug}/orders/${orderId}/payment`,
    { requestId: paymentId },
  ).expect(201);
  assert.equal(replay.body.id, paymentId);
  const order = (await call("owner", "get", path(`/orders/${orderId}`))).body;
  await call("owner", "put", path(`/orders/${orderId}`), {
    version: order.version,
    address: "Changed",
    city: "Changed",
    internalNote: "",
  }).expect(409);
  await call(
    "outsider",
    "get",
    `/public/stores/${slug}/orders/${orderId}/payment`,
  ).expect(404);
  await dispatch(paymentId);
  const ready = (
    await call(
      "buyer",
      "get",
      `/public/stores/${slug}/orders/${orderId}/payment`,
    )
  ).body;
  assert.match(ready.checkoutUrl, /^https:\/\/provider.example/);
  assert.equal(requests.get(paymentId)?.calls, 1);
});
test("signed capture consumes held stock exactly once, validates amount, and creates a balanced immutable journal", async () => {
  await callback(event(paymentId, "payment.captured", 1)).expect(409);
  const proof = event(paymentId, "payment.captured", 21500);
  await callback(proof).expect(201);
  const replay = await callback(proof).expect(201);
  assert.equal(replay.body.replay, true);
  await callback(event(paymentId, "payment.captured", 21500)).expect(201);
  const paid = (await call("owner", "get", path(`/orders/${orderId}`))).body;
  assert.equal(paid.payment, "paid");
  assert.equal(paid.reservation, "consumed");
  const product = (await call("owner", "get", path(`/products/${productId}`)))
    .body;
  assert.equal(product.stock, 18);
  assert.equal(product.reservedStock, 0);
  const summary = (await call("owner", "get", `/wallet/store/${slug}`)).body;
  assert.equal(summary.availableCents, 0);
  assert.equal(summary.pendingCents, 20963);
  const journal = (await call("owner", "get", `/wallet/store/${slug}/journal`))
    .body;
  assert.equal(journal.total, 1);
  assert.equal(
    journal.items[0].postings.reduce(
      (sum: number, p: { deltaCents: number }) => sum + p.deltaCents,
      0,
    ),
    0,
  );
  const buyer = (
    await call("buyer", "get", `/public/stores/${slug}/orders/${orderId}`)
  ).body;
  assert.ok(!("commissionBasisPoints" in buyer));
  assert.ok(!("financialState" in buyer));
});
test("only provider delivery confirms shipment and settlement; out-of-order shipped events cannot undo delivery", async () => {
  shipmentId = randomUUID();
  await call("owner", "post", path(`/orders/${orderId}/shipment`), {
    requestId: shipmentId,
    carrier: "Actual Carrier",
  }).expect(201);
  await dispatch(shipmentId);
  const delivered = event(shipmentId, "shipment.delivered", 0, {
    tracking: "REAL-TRACKING",
    carrier: "Actual Carrier",
    labelUrl: "https://provider.example/label.pdf",
  });
  await callback(delivered).expect(201);
  await callback(
    event(shipmentId, "shipment.shipped", 0, {
      tracking: "REAL-TRACKING",
      carrier: "Actual Carrier",
    }),
  ).expect(201);
  assert.equal(
    (await call("owner", "get", path(`/orders/${orderId}`))).body.shipment,
    "delivered",
  );
  assert.equal(
    (await call("owner", "get", `/wallet/store/${slug}`)).body.availableCents,
    0,
  );
  await app
    .get<Connection>(DATABASE)
    .models.Order.updateOne(
      { id: orderId },
      { $set: { settleAt: new Date(0) } },
    );
  await app.get(CommerceService).reconcile();
  await app.get(CommerceService).reconcile();
  assert.equal(
    (await call("owner", "get", `/wallet/store/${slug}`)).body.availableCents,
    20963,
  );
});
test("verified bank ownership and atomic balance reservation prevent concurrent double withdrawals", async () => {
  const bankRequestId = randomUUID();
  const verified = await call(
    "owner",
    "post",
    `/wallet/store/${slug}/bank/verify`,
    {
      requestId: bankRequestId,
      version: 0,
      owner: "Actual Owner",
      iban: "TR330006100519786457841326",
    },
  ).expect(201);
  assert.equal(verified.body.maskedIban, "TR••••1326");
  assert.ok(!("iban" in verified.body));
  const repeated = await call(
    "owner",
    "post",
    `/wallet/store/${slug}/bank/verify`,
    {
      requestId: bankRequestId,
      version: 0,
      owner: "Actual Owner",
      iban: "TR330006100519786457841326",
    },
  ).expect(201);
  assert.deepEqual(repeated.body, verified.body);
  assert.equal(requests.get(bankRequestId)!.calls, 1);
  await call("owner", "post", `/wallet/store/${slug}/bank/verify`, {
    requestId: bankRequestId,
    version: 0,
    owner: "Changed owner",
    iban: "TR330006100519786457841326",
  }).expect(409);

  const bank = await app
    .get<Connection>(DATABASE)
    .models.VerifiedBank.findOne({ scopeId: storeId })
    .lean();
  assert.ok(!("iban" in bank!));
  const attempts = await Promise.all([
    call("owner", "post", `/wallet/store/${slug}/withdrawals`, {
      requestId: randomUUID(),
      amountCents: 15000,
    }),
    call("owner", "post", `/wallet/store/${slug}/withdrawals`, {
      requestId: randomUUID(),
      amountCents: 15000,
    }),
  ]);
  assert.deepEqual(attempts.map((r) => r.status).sort(), [201, 409]);
  const withdrawal = attempts.find((r) => r.status === 201)!.body;
  assert.equal(withdrawal.status, "review");
  assert.ok(!("bankReference" in withdrawal));
  assert.equal(
    await app
      .get<Connection>(DATABASE)
      .models.IntegrationJob.countDocuments({ id: withdrawal.id }),
    0,
  );
  await call("buyer", "post", `/platform/withdrawals/${withdrawal.id}/review`, {
    version: 0,
    action: "approve",
    reason: "Fixture approval",
  }).expect(404);
  await call("owner", "post", `/platform/withdrawals/${withdrawal.id}/review`, {
    version: 0,
    action: "approve",
    reason: "Fixture approval",
  }).expect(201);
  await call("owner", "post", `/platform/withdrawals/${withdrawal.id}/review`, {
    version: 0,
    action: "approve",
    reason: "Stale approval",
  }).expect(409);
  await dispatch(withdrawal.id);
  await callback(event(withdrawal.id, "payout.completed", 15000)).expect(201);
  assert.equal(
    (await call("owner", "get", `/wallet/store/${slug}`)).body.availableCents,
    5963,
  );
});
test("platform rejection and owner cancellation release review funds exactly once without a payout job", async () => {
  const before = (await call("owner", "get", `/wallet/store/${slug}`)).body
    .availableCents;
  for (const action of ["reject", "cancel"] as const) {
    const requestId = randomUUID(),
      w = (
        await call("owner", "post", `/wallet/store/${slug}/withdrawals`, {
          requestId,
          amountCents: 100,
        })
      ).body;
    assert.equal(w.status, "review");
    if (action === "reject") {
      await call("owner", "post", `/platform/withdrawals/${w.id}/review`, {
        version: 0,
        action,
        reason: "Fixture rejection",
      }).expect(201);
      await call("owner", "post", `/platform/withdrawals/${w.id}/review`, {
        version: 0,
        action,
        reason: "Repeat",
      }).expect(409);
    } else {
      await call("owner", "post", `/account/withdrawals/${w.id}/cancel`).expect(
        201,
      );
      await call("owner", "post", `/account/withdrawals/${w.id}/cancel`).expect(
        201,
      );
    }
    assert.equal(
      (await call("owner", "get", `/wallet/store/${slug}`)).body.availableCents,
      before,
    );
    assert.equal(
      await app
        .get<Connection>(DATABASE)
        .models.IntegrationJob.countDocuments({ id: w.id }),
      0,
    );
  }
  const list = (
    await call("owner", "get", `/wallet/store/${slug}/withdrawals?limit=1`)
  ).body;
  assert.equal(list.items.length, 1);
  assert.ok(list.total >= 3);
  assert.ok(!("bankReference" in list.items[0]));
});
test("return approval and receipt do not fake a refund; signed refund restores inventory only once", async () => {
  const id = randomUUID();
  await call(
    "outsider",
    "post",
    `/public/stores/${slug}/orders/${orderId}/return`,
    { requestId: id, reason: "Actual reason" },
  ).expect(404);
  await call(
    "buyer",
    "post",
    `/public/stores/${slug}/orders/${orderId}/return`,
    { requestId: id, reason: "Actual reason" },
  ).expect(201);
  await call("owner", "post", path(`/returns/${id}/transition`), {
    version: 0,
    action: "approve",
  }).expect(201);
  await call("owner", "post", path(`/returns/${id}/transition`), {
    version: 1,
    action: "receive",
    restock: true,
  }).expect(201);
  assert.equal(
    (await call("owner", "get", path(`/orders/${orderId}`))).body.payment,
    "paid",
  );
  await dispatch(id);
  const proof = event(id, "refund.completed", 21500);
  await callback(proof).expect(201);
  await callback(proof).expect(201);
  assert.equal(
    (await call("owner", "get", path(`/orders/${orderId}`))).body.payment,
    "refunded",
  );
  assert.equal(
    (await call("owner", "get", path(`/products/${productId}`))).body.stock,
    20,
  );
  assert.equal(
    (await call("owner", "get", `/wallet/store/${slug}`)).body.availableCents,
    -15000,
  );
});

const productInput = (extra: object = {}) => ({
  name: "Variant Product",
  category: "Giyim",
  description: "",
  sku: randomUUID(),
  barcode: "",
  priceCents: 10000,
  costCents: 2000,
  currency: "TRY",
  stock: 10,
  variants: [],
  images: ["/dropshipping/cardigan.jpg"],
  status: "live",
  model: "own",
  seoTitle: "",
  seoDescription: "",
  ...extra,
});
async function buyerOrder(quantity = 1, product = productId, variant = "") {
  return (
    await call("buyer", "post", `/public/stores/${slug}/orders`, {
      requestId: randomUUID(),
      customer: "Actual Buyer",
      email: "buyer-settlement@example.com",
      city: "İzmir",
      address: "Gerçek adres",
      lines: [{ productId: product, quantity, variant }],
    }).expect(201)
  ).body;
}
async function confirmPaid(order: { id: string }) {
  const payment = (
    await call(
      "buyer",
      "post",
      `/public/stores/${slug}/orders/${order.id}/payment`,
      { requestId: randomUUID() },
    ).expect(201)
  ).body;
  await dispatch(payment.id);
  await callback(
    event(payment.id, "payment.captured", payment.amountCents),
  ).expect(201);
  return payment;
}
async function settledSale(quantity = 1) {
  const { scopeId: _scope, ...policy } = (
    await call("owner", "get", path("/checkout-policy"))
  ).body;
  await call("owner", "put", `/platform/stores/${storeId}/commerce-policy`, {
    ...policy,
    returnDays: 0,
  }).expect(200);
  const order = await buyerOrder(quantity),
    payment = await confirmPaid(order);
  const ship = (
    await call("owner", "post", path(`/orders/${order.id}/shipment`), {
      requestId: randomUUID(),
      carrier: "Actual Carrier",
    }).expect(201)
  ).body;
  await dispatch(ship.id);
  await callback(
    event(ship.id, "shipment.delivered", 0, {
      tracking: "REAL-TRACKING",
      carrier: "Actual Carrier",
    }),
  ).expect(201);
  await app.get(CommerceService).reconcile();
  return { order, payment };
}

test("variant prices and inventory are authoritative, last-unit races roll back and manual stock retries are idempotent", async () => {
  const small = randomUUID(),
    large = randomUUID(),
    payload = productInput({
      stock: 3,
      priceCents: 11000,
      variants: ["S", "L"],
      options: [
        {
          id: small,
          name: "S",
          sku: randomUUID(),
          priceCents: 11000,
          stock: 1,
        },
        {
          id: large,
          name: "L",
          sku: randomUUID(),
          priceCents: 22000,
          stock: 2,
        },
      ],
    }),
    product = (
      await call("owner", "post", path("/products"), payload).expect(201)
    ).body;
  const input = {
    customer: "Buyer",
    city: "İzmir",
    address: "Address",
    lines: [{ productId: product.id, quantity: 1, variant: small }],
  };
  const results = await Promise.all([
    call("buyer", "post", `/public/stores/${slug}/orders`, {
      ...input,
      requestId: randomUUID(),
    }),
    call("buyer", "post", `/public/stores/${slug}/orders`, {
      ...input,
      requestId: randomUUID(),
    }),
  ]);
  assert.deepEqual(results.map((r) => r.status).sort(), [201, 409]);
  const order = results.find((r) => r.status === 201)!.body;
  assert.equal(order.items[0].unitCents, 11000);
  assert.equal(order.items[0].variantId, small);
  let current = (await call("owner", "get", path(`/products/${product.id}`)))
    .body;
  assert.equal(current.stock, 2);
  assert.equal(current.reservedStock, 1);
  assert.equal(
    current.options.find((o: { id: string; stock: number }) => o.id === small)
      .stock,
    0,
  );
  await call(
    "buyer",
    "post",
    `/public/stores/${slug}/orders/${order.id}/cancel`,
    { version: order.version },
  ).expect(201);
  const stockId = randomUUID();
  await call("owner", "post", path(`/products/${product.id}/stock`), {
    requestId: stockId,
    variant: large,
    amount: 2,
  }).expect(201);
  await call("owner", "post", path(`/products/${product.id}/stock`), {
    requestId: stockId,
    variant: large,
    amount: 2,
  }).expect(201);
  await call("owner", "post", path(`/products/${product.id}/stock`), {
    requestId: stockId,
    variant: large,
    amount: 3,
  }).expect(409);
  current = (await call("owner", "get", path(`/products/${product.id}`))).body;
  assert.equal(current.stock, 5);
  assert.equal(
    current.options.find((o: { id: string; stock: number }) => o.id === large)
      .stock,
    4,
  );
  await call(
    "owner",
    "post",
    path("/products"),
    productInput({
      sku: (payload as typeof payload & { options: { sku: string }[] })
        .options[0].sku,
    }),
  ).expect(409);
});

test("checkout consumes the actual cart once and stale versions never create an order or consume stock", async () => {
  const cartResponse = await call(
      "buyer",
      "get",
      `/public/stores/${slug}/cart`,
    ).expect(200),
    cartCookie = String(cartResponse.headers["set-cookie"][0]).split(";")[0];
  const cartApi = (
    method: "get" | "put" | "post",
    suffix: string,
    body?: object,
  ) => {
    const req = api()
      [method](`/api/v1/public/stores/${slug}/${suffix}`)
      .set("Cookie", [accounts.buyer.cookie, cartCookie].join("; "))
      .set("Origin", origin);
    return body ? req.send(body) : req;
  };
  const cart = (
    await cartApi("put", "cart", {
      version: cartResponse.body.version,
      lines: [{ productId, quantity: 1 }],
    }).expect(200)
  ).body;
  const input = {
    requestId: randomUUID(),
    cartVersion: cart.version,
    customer: "Buyer",
    address: "Address",
    city: "İzmir",
  };
  await cartApi("post", "checkout", {
    ...input,
    cartVersion: cart.version - 1,
  }).expect(409);
  const created = (await cartApi("post", "checkout", input).expect(201)).body,
    replay = (await cartApi("post", "checkout", input).expect(201)).body;
  assert.equal(replay.id, created.id);
  assert.equal((await cartApi("get", "cart").expect(200)).body.lines.length, 0);
  await cartApi("post", "checkout", { ...input, city: "Başka" }).expect(409);
  await call(
    "buyer",
    "post",
    `/public/stores/${slug}/orders/${created.id}/cancel`,
    { version: created.version },
  ).expect(201);
});

test("a single-use coupon survives concurrent claims without overuse and is released after reservation cancellation", async () => {
  const code = "LAST-" + randomUUID().slice(0, 8).toUpperCase();
  const coupon = (
    await call("owner", "post", path("/coupons"), {
      code,
      kind: "percent",
      amount: 10,
      minimumCents: 0,
      limitUses: 1,
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
      active: true,
      reusableAfterRefund: true,
    }).expect(201)
  ).body;
  const first = await buyerOrder(),
    second = await buyerOrder();
  const paid = await Promise.all(
    [first, second].map((order) =>
      call(
        "buyer",
        "post",
        `/public/stores/${slug}/orders/${order.id}/payment`,
        { requestId: randomUUID(), couponCode: code },
      ),
    ),
  );
  assert.deepEqual(paid.map((r) => r.status).sort(), [201, 409]);
  const current = (
    await call("owner", "get", path("/coupons"))
  ).body.items.find((c: { id: string; used: number }) => c.id === coupon.id);
  assert.equal(current.used, 1);
  for (const order of [first, second]) {
    const detail = (
      await call("buyer", "get", `/public/stores/${slug}/orders/${order.id}`)
    ).body;
    await call(
      "buyer",
      "post",
      `/public/stores/${slug}/orders/${order.id}/cancel`,
      { version: detail.version },
    ).expect(201);
  }
  assert.equal(
    (await call("owner", "get", path("/coupons"))).body.items.find(
      (c: { id: string; used: number }) => c.id === coupon.id,
    ).used,
    0,
  );
});

test("late and concurrent capture callbacks produce one liability and compensation refund without granting income", async () => {
  const order = await buyerOrder(),
    payment = (
      await call(
        "buyer",
        "post",
        `/public/stores/${slug}/orders/${order.id}/payment`,
        { requestId: randomUUID() },
      ).expect(201)
    ).body;
  await dispatch(payment.id);
  const current = (
    await call("buyer", "get", `/public/stores/${slug}/orders/${order.id}`)
  ).body;
  await call(
    "buyer",
    "post",
    `/public/stores/${slug}/orders/${order.id}/cancel`,
    { version: current.version },
  ).expect(201);
  const before = (await call("owner", "get", `/wallet/store/${slug}`)).body,
    proof = event(payment.id, "payment.captured", payment.amountCents),
    responses = await Promise.all([callback(proof), callback(proof)]);
  assert.deepEqual(
    responses.map((r) => r.status),
    [201, 201],
  );
  assert.equal(responses.filter((r) => r.body.replay).length, 1);
  const after = (await call("owner", "get", `/wallet/store/${slug}`)).body;
  assert.deepEqual(after, before);
  assert.equal(
    (await call("owner", "get", path(`/payments/${payment.id}`))).body.status,
    "captured-late",
  );
  const refund = (
    await call(
      "buyer",
      "get",
      `/public/stores/${slug}/orders/${order.id}/return`,
    )
  ).body;
  await dispatch(refund.id);
  await callback(
    event(refund.id, "refund.completed", payment.amountCents),
  ).expect(201);
  assert.equal(
    (await call("buyer", "get", `/public/stores/${slug}/orders/${order.id}`))
      .body.payment,
    "pending",
  );
});

test("paid order cancellation returns inventory and money only after a signed refund and CRM metrics reverse", async () => {
  await call("owner", "post", path("/crm/customers"), {
    name: "Buyer",
    email: "buyer-settlement@example.com",
    phone: "",
    city: "İzmir",
    consent: false,
    note: "",
  }).expect(201);
  const order = await buyerOrder(),
    payment = await confirmPaid(order),
    paid = (await call("owner", "get", path(`/orders/${order.id}`))).body;
  const metric = (
    await call("owner", "get", path("/crm/customers?q=buyer-settlement"))
  ).body.items[0];
  assert.equal(metric.orders, 1);
  assert.equal(metric.spentCents, payment.amountCents);
  assert.ok(metric.points > 0);
  const id = randomUUID(),
    request = { requestId: id, version: paid.version, reason: "Alıcı talebi" };
  await call(
    "owner",
    "post",
    path(`/orders/${order.id}/refund-unshipped`),
    request,
  ).expect(201);
  await call(
    "owner",
    "post",
    path(`/orders/${order.id}/refund-unshipped`),
    request,
  ).expect(201);
  assert.equal(
    (await call("owner", "get", path(`/orders/${order.id}`))).body.payment,
    "paid",
  );
  await dispatch(id);
  const proof = event(id, "refund.completed", payment.amountCents);
  await callback(proof).expect(201);
  await callback(proof).expect(201);
  assert.equal(
    (await call("owner", "get", path(`/orders/${order.id}`))).body.payment,
    "refunded",
  );
  assert.equal(
    (await call("owner", "get", path("/crm/customers?q=buyer-settlement"))).body
      .items[0].spentCents,
    0,
  );
});

let supplierId: string, supplyId: string, supplyLink: string;
test("wholesale requires actual wallet funds, enforces minimum quantities and separates supplier stock from retail imports", async () => {
  await settledSale(10);
  const submission = (
    await call("outsider", "post", "/applications/account/supplier", {
      companyName: "Real Supplier",
      contact: "outsider-settlement@example.com",
      category: "Giyim",
    }).expect(201)
  ).body;
  const partner = (
    await call(
      "owner",
      "post",
      `/platform/applications/${submission.id}/decision`,
      { version: 0, status: "approved", reason: "Reviewed" },
    ).expect(201)
  ).body.partner;
  supplierId = partner.id;
  const product = (
    await call("outsider", "post", `/partners/${supplierId}/products`, {
      name: "Wholesale Product",
      sku: randomUUID(),
      category: "Giyim",
      description: "",
      priceCents: 1000,
      stock: 10,
      minimum: 2,
      images: ["/dropshipping/cardigan.jpg"],
      active: true,
    }).expect(201)
  ).body;
  supplyId = product.id;
  const link = (
    await call("owner", "post", path("/partners"), {
      partnerId: supplierId,
    }).expect(201)
  ).body;
  supplyLink = link.id;
  await call("outsider", "post", `/links/${link.id}/transition`, {
    version: link.version,
    action: "accept",
  }).expect(201);
  const input = {
    requestId: randomUUID(),
    partnerId: supplierId,
    productId: supplyId,
    quantity: 1,
    maxTotalCents: 2000,
    customer: "Merchant",
    city: "İzmir",
    address: "Address",
    phone: "",
  };
  await call("owner", "post", path("/wholesale-orders"), input).expect(409);
  await call("owner", "post", path("/wholesale-orders"), {
    ...input,
    requestId: randomUUID(),
    quantity: 2,
    maxTotalCents: 1999,
  }).expect(409);
  const before = (await call("owner", "get", `/wallet/store/${slug}`)).body
      .availableCents,
    wholesale = (
      await call("owner", "post", path("/wholesale-orders"), {
        ...input,
        quantity: 2,
      }).expect(201)
    ).body;
  await call("owner", "post", path("/wholesale-orders"), {
    ...input,
    quantity: 2,
  }).expect(201);
  assert.equal(
    (await call("owner", "get", `/wallet/store/${slug}`)).body.availableCents,
    before - 2000,
  );
  const reserved = (
    await call("outsider", "get", `/partners/${supplierId}/products`)
  ).body.items[0];
  assert.equal(reserved.stock, 8);
  assert.equal(reserved.reservedStock, 2);
  await call(
    "owner",
    "post",
    path(`/wholesale-orders/${wholesale.id}/cancel`),
    { version: wholesale.version },
  ).expect(201);
  await call(
    "owner",
    "post",
    path(`/wholesale-orders/${wholesale.id}/cancel`),
    { version: wholesale.version },
  ).expect(201);
  assert.equal(
    (await call("owner", "get", `/wallet/store/${slug}`)).body.availableCents,
    before,
  );
  const importedInput = {
      requestId: randomUUID(),
      partnerId: supplierId,
      productId: supplyId,
      priceCents: 1800,
    },
    imported = (
      await call(
        "owner",
        "post",
        path("/supply-imports"),
        importedInput,
      ).expect(201)
    ).body;
  assert.equal(imported.stock, 0);
  assert.equal(imported.status, "draft");
  assert.equal(imported.costCents, 1000);
  assert.equal(
    (
      await call(
        "owner",
        "post",
        path("/supply-imports"),
        importedInput,
      ).expect(201)
    ).body.id,
    imported.id,
  );
});

test("funded collaboration cancellation requires the other participant and releases escrow exactly once", async () => {
  const offer = (
    await call("owner", "post", `/links/${supplyLink}/offers`, {
      requestId: randomUUID(),
      title: "Paid work",
      brief: "Brief",
      deliverables: "Content",
      deadline: "2027-01-01",
      kind: "paid",
      feeCents: 1000,
    }).expect(201)
  ).body;
  const accepted = (
      await call("outsider", "post", `/offers/${offer.id}/transition`, {
        version: offer.version,
        action: "accept",
      }).expect(201)
    ).body,
    before = (await call("owner", "get", `/wallet/store/${slug}`)).body
      .availableCents;
  const funded = (
    await call("owner", "post", `/offers/${offer.id}/fund`, {
      version: accepted.version,
    }).expect(201)
  ).body;
  assert.equal(
    (await call("owner", "get", `/wallet/store/${slug}`)).body.availableCents,
    before - 1000,
  );
  const link = (await call("owner", "get", path("/partners"))).body.items.find(
    (l: { id: string; version: number }) => l.id === supplyLink,
  );
  await call("owner", "post", `/links/${supplyLink}/transition`, {
    version: link.version,
    action: "close",
  }).expect(409);
  const pending = (
    await call("owner", "post", `/offers/${offer.id}/cancellation`, {
      version: funded.version,
      action: "request",
    }).expect(201)
  ).body;
  await call("owner", "post", `/offers/${offer.id}/cancellation`, {
    version: pending.version,
    action: "approve",
  }).expect(409);
  const cancelled = (
    await call("outsider", "post", `/offers/${offer.id}/cancellation`, {
      version: pending.version,
      action: "approve",
    }).expect(201)
  ).body;
  assert.equal(cancelled.status, "cancelled");
  assert.equal(
    (await call("owner", "get", `/wallet/store/${slug}`)).body.availableCents,
    before,
  );
});

test("outbox obeys opt-out before dispatch, successful HTTP acceptance is not delivery and repeated proof does not double-send", async () => {
  const notify = app.get(NotificationsService),
    customers = (await call("owner", "get", path("/crm/customers"))).body.items,
    buyer = customers.find(
      (c: { email: string; id: string }) =>
        c.email === "buyer-settlement@example.com",
    );
  await app.get(CrmService).optOut(storeId, buyer.id, true);
  const draft = (
    await call("owner", "post", path("/crm/communications"), {
      requestId: randomUUID(),
      kind: "email",
      segment: "all",
      subject: "Test campaign",
      message: "Real queued message",
    }).expect(201)
  ).body;
  const batch = (
    await call("owner", "post", path(`/communications/${draft.id}/send`), {
      requestId: randomUUID(),
      version: draft.version,
    }).expect(201)
  ).body;
  await notify.produceOnce();
  const db = app.get<Connection>(DATABASE),
    first = (await db.models.NotificationDelivery.findOne({
      batchId: batch.id,
    }).lean())!;
  assert.ok(first);
  await app.get(CrmService).optOut(storeId, buyer.id, false);
  await notify.dispatchOnce();
  assert.equal(
    (await db.models.NotificationDelivery.findOne({ id: first.id }).lean())!
      .status,
    "skipped",
  );
  assert.ok(!requests.has(first.id));
  await app.get(CrmService).optOut(storeId, buyer.id, true);
  const secondBatch = (
    await call("owner", "post", path(`/communications/${draft.id}/send`), {
      requestId: randomUUID(),
      version: draft.version,
    }).expect(201)
  ).body;
  await notify.produceOnce();
  await notify.dispatchOnce();
  const second = (await db.models.NotificationDelivery.findOne({
    batchId: secondBatch.id,
  }).lean())!;
  assert.equal(second.status, "awaiting");
  const proof = event(second.id, "notification.sent", 0);
  await callback(proof).expect(201);
  await callback(proof).expect(201);
  assert.equal(
    (await db.models.NotificationDelivery.findOne({ id: second.id }).lean())!
      .status,
    "sent",
  );
  assert.equal(requests.get(second.id)!.calls, 1);
});

test("AI jobs reserve credits, protect source ownership, persist real normalized outputs and require proof to consume credits", async () => {
  await call("owner", "put", "/platform/studio-policy", {
    version: 0,
    costs: { model: 8, scene: 3, upscale: 2 },
    creditPriceCents: 50,
  }).expect(200);
  await call("owner", "post", `/platform/stores/${storeId}/studio-credits`, {
    requestId: randomUUID(),
    credits: 20,
  }).expect(201);
  const input = {
    requestId: randomUUID(),
    productId,
    sourceUrl: "/dropshipping/cardigan.jpg",
    mode: "model",
    prompt: "Test image",
    ratio: "1:1",
  };
  await call("owner", "post", path("/studio/jobs"), {
    ...input,
    sourceUrl: "http://127.0.0.1/private",
  }).expect(422);
  const job = (
    await call("owner", "post", path("/studio/jobs"), input).expect(201)
  ).body;
  await call("owner", "post", path("/studio/jobs"), input).expect(201);
  assert.equal(
    (await call("owner", "get", path("/studio"))).body.credits.available,
    12,
  );
  await call(
    "outsider",
    "post",
    `/partners/${supplierId}/studio/jobs/${job.id}/cancel`,
  ).expect(404);
  assert.ok(!requests.has(`cancel:${job.id}`));
  await dispatch(job.id);
  const proof = event(job.id, "ai.completed", 0, { outputCount: 1 });
  await callback(proof).expect(201);
  await callback(proof).expect(201);
  const completed = (await call("owner", "get", path(`/studio/jobs/${job.id}`)))
    .body;
  assert.equal(completed.status, "completed");
  assert.equal(completed.outputs.length, 1);
  const binary = await api().get(completed.outputs[0]).expect(200);
  assert.equal(binary.headers["content-type"], "image/webp");
  const stats = (await call("owner", "get", path("/studio"))).body.credits;
  assert.equal(stats.spent, 8);
  assert.equal(stats.held, 0);
  const product = (await call("owner", "get", path(`/products/${productId}`)))
    .body;
  await call("owner", "post", path(`/studio/jobs/${job.id}/publish`), {
    cover: true,
    productVersion: product.version,
  }).expect(201);
  assert.equal(
    (await call("owner", "get", path(`/products/${productId}`))).body.images[0],
    completed.outputs[0],
  );
  const cancelled = (
    await call("owner", "post", path("/studio/jobs"), {
      ...input,
      requestId: randomUUID(),
      mode: "scene",
    }).expect(201)
  ).body;
  await dispatch(cancelled.id);
  await call(
    "owner",
    "post",
    path(`/studio/jobs/${cancelled.id}/cancel`),
  ).expect(201);
  await call(
    "owner",
    "post",
    path(`/studio/jobs/${cancelled.id}/cancel`),
  ).expect(201);
  assert.equal(
    (await call("owner", "get", path("/studio"))).body.credits.available,
    12,
  );
});

test("AI credit purchases and refunds require signed payment proof and do not create gift credits", async () => {
  const purchase = (
    await call("owner", "post", path("/studio/credit-purchases"), {
      requestId: randomUUID(),
      credits: 10,
    }).expect(201)
  ).body;
  const before = (await call("owner", "get", path("/studio"))).body.credits
    .available;
  assert.equal(purchase.amountCents, 500);
  await dispatch(purchase.id);
  await callback(event(purchase.id, "payment.captured", 499)).expect(409);
  await callback(event(purchase.id, "payment.captured", 500)).expect(201);
  assert.equal(
    (await call("owner", "get", path("/studio"))).body.credits.available,
    before + 10,
  );
  const refund = (
    await call(
      "owner",
      "post",
      path(`/studio/credit-purchases/${purchase.id}/refund`),
    ).expect(201)
  ).body;
  assert.equal(
    (await call("owner", "get", path("/studio"))).body.credits.available,
    before,
  );
  await dispatch(refund.id);
  const proof = event(refund.id, "refund.completed", 500);
  await callback(proof).expect(201);
  await callback(proof).expect(201);
});

test("platform staff permissions are real, read access does not grant writes and live sessions isolate participants", async () => {
  const input = {
    version: 0,
    role: "support",
    pages: ["overview", "support", "live"],
    write: false,
    status: "active",
  };
  await call(
    "owner",
    "put",
    `/platform/staff/${accounts.outsider.id}`,
    input,
  ).expect(200);
  await call("outsider", "get", "/platform/support").expect(200);
  await call("outsider", "get", "/platform/sales").expect(404);
  await call("outsider", "get", "/platform/staff").expect(404);
  const live = (
    await call("buyer", "post", "/account/live-support", {
      requestId: randomUUID(),
      source: "buyer",
      subject: "Need help",
    }).expect(201)
  ).body;
  await call("outsider", "get", `/account/live-support/${live.id}`).expect(404);
  await call(
    "outsider",
    "put",
    `/platform/live-support/${live.id}/assignment`,
    { version: live.version, assignedTo: accounts.outsider.id },
  ).expect(404);
  await call("owner", "put", `/platform/staff/${accounts.outsider.id}`, {
    ...input,
    version: 1,
    write: true,
  }).expect(200);
  const assigned = (
    await call(
      "outsider",
      "put",
      `/platform/live-support/${live.id}/assignment`,
      { version: live.version, assignedTo: accounts.outsider.id },
    ).expect(200)
  ).body;
  const message = { messageId: randomUUID(), text: "How can I help?" };
  await call(
    "outsider",
    "post",
    `/platform/live-support/${live.id}/messages`,
    message,
  ).expect(201);
  await call(
    "outsider",
    "post",
    `/platform/live-support/${live.id}/messages`,
    message,
  ).expect(201);
  assert.equal(
    (await call("buyer", "get", `/account/live-support/${live.id}/messages`))
      .body.total,
    1,
  );
  const ticket = (
    await call("owner", "post", path("/support"), {
      channel: "platform",
      category: "Teknik",
      subject: "Internal note test",
      priority: "normal",
      text: "Request",
    }).expect(201)
  ).body;
  await call(
    "outsider",
    "put",
    `/platform/stores/${storeId}/support/${ticket.id}/review`,
    {
      version: ticket.version,
      assignedTo: accounts.outsider.id,
      internalNote: "Staff only",
      priority: "high",
    },
  ).expect(200);
  assert.equal(
    (
      await call(
        "outsider",
        "get",
        `/platform/stores/${storeId}/support/${ticket.id}`,
      )
    ).body.internalNote,
    "Staff only",
  );
  assert.ok(
    !(
      "internalNote" in
      (await call("owner", "get", path(`/support/${ticket.id}`))).body
    ),
  );
  const current = (
    await call("buyer", "get", `/account/live-support/${live.id}`)
  ).body;
  assert.ok(current.version > assigned.version);
  await call("buyer", "post", `/account/live-support/${live.id}/close`, {
    version: current.version,
  }).expect(201);
  await call("outsider", "post", `/platform/live-support/${live.id}/messages`, {
    messageId: randomUUID(),
    text: "Late reply",
  }).expect(409);
  await call("owner", "put", `/platform/staff/${accounts.outsider.id}`, {
    ...input,
    version: 2,
    write: true,
    status: "paused",
  }).expect(200);
  await call("outsider", "get", "/platform/support").expect(404);
  await call(
    "outsider",
    "put",
    `/platform/staff/${accounts.buyer.id}`,
    input,
  ).expect(404);
});

test("referrals snapshot registration terms and use a real settled sale and refund as their only money sources", async () => {
  const code = "REFER-" + randomUUID().slice(0, 8).toUpperCase();
  const codeInput = {
    requestId: randomUUID(),
    ownerId: accounts.buyer.id,
    code,
    title: "Reviewed Referral",
    kind: "referral",
    rewardBps: 1000,
    discountBps: 0,
    discountStoreId: "",
    discountUses: 0,
    startsOn: "2026-01-01",
    endsOn: "2027-12-31",
    active: true,
    qualification: "merchant-first-settled-sale",
  };
  const saved = (
    await call("owner", "post", "/platform/referral-codes", codeInput).expect(
      201,
    )
  ).body;
  const registered = await api()
    .post("/api/v1/auth/register")
    .set("Origin", origin)
    .send({
      name: "Referred Merchant",
      store: "Referred Store",
      email: "referred-settlement@example.com",
      password: "Referred2026!",
      referralCode: code,
    })
    .expect(201);
  accounts.referred = {
    id: registered.body.user.id,
    cookie: String(registered.headers["set-cookie"][0]).split(";")[0],
  };
  const { requestId: _request, ...terms } = codeInput;
  await call("owner", "put", `/platform/referral-codes/${saved.id}`, {
    ...terms,
    rewardBps: 2000,
    version: saved.version,
  }).expect(200);
  await call("owner", "post", "/platform/referral-codes", codeInput).expect(
    201,
  );
  const foreign = registered.body.stores[0],
    store = (await call("referred", "get", `/stores/${foreign.slug}`)).body,
    { id: _id, ...settings } = store;
  await call("referred", "put", `/stores/${foreign.slug}/settings`, {
    ...settings,
    isOpen: true,
  }).expect(200);
  await call("owner", "put", `/platform/stores/${foreign.id}/commerce-policy`, {
    version: 0,
    commissionBasisPoints: 250,
    returnDays: 30,
    shippingMode: "fixed",
    fixedShippingCents: 0,
  }).expect(200);
  const product = (
    await call(
      "referred",
      "post",
      `/stores/${foreign.slug}/products`,
      productInput({ priceCents: 20000 }),
    ).expect(201)
  ).body;
  const order = (
    await call("buyer", "post", `/public/stores/${foreign.slug}/orders`, {
      requestId: randomUUID(),
      customer: "Buyer",
      city: "İzmir",
      address: "Address",
      lines: [{ productId: product.id, quantity: 1, variant: "" }],
    }).expect(201)
  ).body;
  const payment = (
    await call(
      "buyer",
      "post",
      `/public/stores/${foreign.slug}/orders/${order.id}/payment`,
      { requestId: randomUUID() },
    ).expect(201)
  ).body;
  await dispatch(payment.id);
  await callback(
    event(payment.id, "payment.captured", payment.amountCents),
  ).expect(201);
  const db = app.get<Connection>(DATABASE),
    conversion = (await db.models.ReferralConversion.findOne({
      customerId: accounts.referred.id,
    }).lean())!;
  assert.equal(conversion.rewardBps, 1000);
  assert.equal(conversion.rewardCents, 0);
  assert.equal(conversion.status, "registered");
  const shipment = (
    await call(
      "referred",
      "post",
      `/stores/${foreign.slug}/orders/${order.id}/shipment`,
      { requestId: randomUUID(), carrier: "Actual Carrier" },
    ).expect(201)
  ).body;
  await dispatch(shipment.id);
  await callback(
    event(shipment.id, "shipment.delivered", 0, {
      tracking: "REAL-TRACKING",
      carrier: "Actual Carrier",
    }),
  ).expect(201);
  // Advance maturity in this isolated fixture. Production cannot edit this timestamp through any API.
  await db.models.Order.updateOne(
    { id: order.id },
    { $set: { settleAt: new Date(0) } },
  );
  await app.get(CommerceService).reconcile();
  await app.get(CommerceService).reconcile();
  const qualified = (await db.models.ReferralConversion.findOne({
    customerId: accounts.referred.id,
  }).lean())!;
  assert.equal(qualified.sourceId, order.id);
  assert.equal(qualified.commissionBaseCents, 500);
  assert.equal(qualified.rewardCents, 50);
  assert.equal(
    (await call("buyer", "get", "/wallet/account/me")).body.availableCents,
    50,
  );
  const returned = (
    await call(
      "buyer",
      "post",
      `/public/stores/${foreign.slug}/orders/${order.id}/return`,
      { requestId: randomUUID(), reason: "Return" },
    ).expect(201)
  ).body;
  const approved = (
    await call(
      "referred",
      "post",
      `/stores/${foreign.slug}/returns/${returned.id}/transition`,
      { version: returned.version, action: "approve" },
    ).expect(201)
  ).body;
  await call(
    "referred",
    "post",
    `/stores/${foreign.slug}/returns/${returned.id}/transition`,
    { version: approved.version, action: "receive", restock: true },
  ).expect(201);
  await dispatch(returned.id);
  const proof = event(returned.id, "refund.completed", payment.amountCents);
  await callback(proof).expect(201);
  await callback(proof).expect(201);
  assert.equal(
    (await call("buyer", "get", "/wallet/account/me")).body.availableCents,
    0,
  );
  await api()
    .post("/api/v1/auth/register")
    .set("Origin", origin)
    .send({
      name: "Invalid referral",
      email: "invalid-ref-settlement@example.com",
      password: "Referred2026!",
      referralCode: "UNKNOWN",
    })
    .expect(409);
  assert.equal(
    await db.models.User.countDocuments({
      email: "invalid-ref-settlement@example.com",
    }),
    0,
  );
});

test("expired invitations release their quota atomically, reissue revokes the old link and rate buckets are shared", async () => {
  const first = (
      await call("owner", "post", path("/team/invitations"), {
        email: "invite-old@example.com",
        role: "viewer",
      }).expect(201)
    ).body,
    db = app.get<Connection>(DATABASE);
  await db.models.StoreMembership.updateOne(
    { id: first.id },
    { $set: { expiresAt: new Date(0) } },
  );
  await call("owner", "get", path("/team")).expect(200);
  assert.equal(
    await db.models.StoreMembership.countDocuments({ id: first.id }),
    0,
  );
  assert.equal(
    (await db.models.StoreTeamQuota.findOne({ storeId }).lean())!.count,
    0,
  );
  const second = (
      await call("owner", "post", path("/team/invitations"), {
        email: "buyer-settlement@example.com",
        role: "viewer",
      }).expect(201)
    ).body,
    reissued = (
      await call("owner", "post", path(`/team/${second.id}/reissue`), {
        version: 0,
      }).expect(201)
    ).body;
  await call("buyer", "post", "/team/accept", { token: second.token }).expect(
    422,
  );
  await call("buyer", "post", "/team/accept", { token: reissued.token }).expect(
    201,
  );
  assert.equal(
    (await db.models.StoreTeamQuota.findOne({ storeId }).lean())!.count,
    1,
  );
  const limiter = app.get(RateLimiter),
    results = await Promise.all(
      Array.from({ length: 8 }, () =>
        limiter.consume("192.0.2.1", "test-shared", 3),
      ),
    );
  assert.equal(results.filter((r) => r.allowed).length, 3);
  assert.ok(results.every((r) => r.retryAfter > 0));
});

test("supplier shipment proofs consume reserved stock once, honor maturity and expose the incoming wallet journal", async () => {
  const order = (
    await call("owner", "post", path("/wholesale-orders"), {
      requestId: randomUUID(),
      partnerId: supplierId,
      productId: supplyId,
      quantity: 2,
      maxTotalCents: 2000,
      customer: "Merchant",
      address: "Address",
      city: "İzmir",
      phone: "",
    }).expect(201)
  ).body;
  await call(
    "buyer",
    "get",
    `/partners/${supplierId}/wholesale-orders/${order.id}`,
  ).expect(404);
  const shipmentId = randomUUID();
  await call(
    "outsider",
    "post",
    `/partners/${supplierId}/wholesale-orders/${order.id}/shipment`,
    { requestId: shipmentId, carrier: "Actual Carrier" },
  ).expect(201);
  await dispatch(shipmentId);
  const delivered = event(shipmentId, "shipment.delivered", 0, {
    tracking: "REAL-TRACKING",
    carrier: "Actual Carrier",
  });
  await callback(delivered).expect(201);
  await callback(delivered).expect(201);
  await callback(
    event(shipmentId, "shipment.shipped", 0, {
      tracking: "REAL-TRACKING",
      carrier: "Actual Carrier",
    }),
  ).expect(201);
  await app.get(CommerceService).reconcile();
  await app.get(CommerceService).reconcile();
  const product = (
    await call("outsider", "get", `/partners/${supplierId}/products`)
  ).body.items.find(
    (p: { id: string; stock: number; reservedStock: number }) =>
      p.id === supplyId,
  );
  assert.equal(product.stock, 8);
  assert.equal(product.reservedStock, 0);
  assert.equal(
    (await call("outsider", "get", `/wallet/partner/${supplierId}`)).body
      .availableCents,
    1950,
  );
  assert.ok(
    (
      await call("outsider", "get", `/wallet/partner/${supplierId}/journal`)
    ).body.items.some(
      (j: { referenceId: string }) => j.referenceId === `wholesale:${order.id}`,
    ),
  );
});

test("invoice and credit documents need actual provider proof; preparing a document never creates a fiscal result or changes money", async () => {
  const order = await buyerOrder(),
    payment = await confirmPaid(order),
    id = randomUUID();
  await call("owner", "post", path(`/orders/${order.id}/invoice`), {
    requestId: id,
  }).expect(503);
  await call("owner", "put", path("/invoice-settings"), {
    version: 0,
    legalName: "Test Legal Seller",
    taxNumber: "1234567890",
    taxOffice: "Test office",
    address: "Test seller address",
    vatBasisPoints: 2000,
  }).expect(200);
  const invoice = (
    await call("owner", "post", path(`/orders/${order.id}/invoice`), {
      requestId: id,
    }).expect(201)
  ).body;
  await call("owner", "post", path(`/orders/${order.id}/invoice`), {
    requestId: id,
  }).expect(201);
  assert.equal(invoice.status, "requested");
  assert.equal(invoice.documentUrl, "");
  await call(
    "outsider",
    "get",
    `/public/stores/${slug}/orders/${order.id}/invoice`,
  ).expect(404);
  await dispatch(invoice.id);
  const proof = event(invoice.id, "invoice.issued", payment.amountCents, {
    providerReference: `provider-${invoice.id}`,
    invoiceNumber: "TEST-INV-1",
    documentUrl: "https://provider.example/invoice.pdf",
  });
  await callback(proof).expect(201);
  await callback(proof).expect(201);
  assert.equal(
    (
      await call(
        "buyer",
        "get",
        `/public/stores/${slug}/orders/${order.id}/invoice`,
      )
    ).body.status,
    "issued",
  );
  const paid = (await call("owner", "get", path(`/orders/${order.id}`))).body,
    refundId = randomUUID();
  await call("owner", "post", path(`/orders/${order.id}/refund-unshipped`), {
    requestId: refundId,
    version: paid.version,
    reason: "Cancellation",
  }).expect(201);
  await dispatch(refundId);
  await callback(
    event(refundId, "refund.completed", payment.amountCents),
  ).expect(201);
  const pendingCredit = (
    await call(
      "buyer",
      "get",
      `/public/stores/${slug}/orders/${order.id}/invoice`,
    )
  ).body;
  assert.ok(pendingCredit.creditJobId);
  assert.equal(pendingCredit.status, "issued");
  await dispatch(pendingCredit.creditJobId);
  const before = (await call("owner", "get", `/wallet/store/${slug}`)).body;
  await callback(
    event(
      pendingCredit.creditJobId,
      "invoice.credit-issued",
      payment.amountCents,
      {
        providerReference: `provider-${pendingCredit.creditJobId}`,
        invoiceNumber: "TEST-CREDIT-1",
        documentUrl: "https://provider.example/credit.pdf",
      },
    ),
  ).expect(201);
  assert.equal(
    (
      await call(
        "buyer",
        "get",
        `/public/stores/${slug}/orders/${order.id}/invoice`,
      )
    ).body.status,
    "credited",
  );
  assert.deepEqual(
    (await call("owner", "get", `/wallet/store/${slug}`)).body,
    before,
  );
});

test("paused accounts lose sessions and store publication while existing buyers keep private order access", async () => {
  const record = (await call("referred", "get", "/auth/me")).body.stores[0];
  await call(
    "owner",
    "put",
    `/platform/accounts/${accounts.referred.id}/control`,
    {
      version: 0,
      status: "paused",
      verified: false,
      note: "Temporarily paused",
    },
  ).expect(200);
  await call("referred", "get", "/auth/me").expect(401);
  await api().get(`/api/v1/public/stores/${record.slug}`).expect(404);
  const orders = (
    await call("buyer", "get", `/public/stores/${record.slug}/orders`)
  ).body;
  assert.ok(orders.total > 0);
  assert.ok(
    orders.items.every(
      (o: { internalNote?: string }) => o.internalNote === undefined,
    ),
  );
  await call(
    "owner",
    "put",
    `/platform/accounts/${accounts.owner.id}/control`,
    {
      version: 0,
      status: "paused",
      verified: false,
      note: "Cannot pause root",
    },
  ).expect(409);
  await call(
    "owner",
    "put",
    `/platform/accounts/${accounts.referred.id}/control`,
    { version: 1, status: "active", verified: false, note: "Restored" },
  ).expect(200);
  await call("referred", "get", "/auth/me").expect(401);
});

test("abandoned-cart automation requires verified identity and permission, creates a restricted coupon and queues once", async () => {
  const db = app.get<Connection>(DATABASE),
    customer = (
      await call("owner", "get", path("/crm/customers?q=buyer-settlement"))
    ).body.items[0];
  await app.get(CrmService).optOut(storeId, customer.id, true);
  await db.models.User.updateOne(
    { id: accounts.buyer.id },
    { $set: { emailVerifiedAt: new Date() } },
  );
  const settings = (await call("owner", "get", path("/crm/settings"))).body;
  await call("owner", "put", path("/crm/settings"), {
    version: settings.version,
    settings: {
      ...settings.settings,
      abandonedEnabled: true,
      delayHours: 1,
      discount: 10,
    },
  }).expect(200);
  const cartResponse = await call(
      "buyer",
      "get",
      `/public/stores/${slug}/cart`,
    ),
    cartCookie = String(cartResponse.headers["set-cookie"][0]).split(";")[0];
  await api()
    .put(`/api/v1/public/stores/${slug}/cart`)
    .set("Origin", origin)
    .set("Cookie", `${accounts.buyer.cookie}; ${cartCookie}`)
    .send({
      version: cartResponse.body.version,
      lines: [{ productId, quantity: 1 }],
    })
    .expect(200);
  await db.models.CrmCustomer.updateOne(
    { id: customer.id },
    { $set: { cartUpdatedAt: new Date(Date.now() - 2 * 3600000) } },
  );
  await app.get(NotificationsService).automateOnce();
  await app.get(NotificationsService).automateOnce();
  const deliveries = await db.models.NotificationDelivery.find({
    batchId: `cart:${customer.id}`,
  }).lean();
  assert.equal(deliveries.length, 1);
  const coupon = (await db.models.Coupon.findOne({
    allowedBuyerId: accounts.buyer.id,
  }).lean())!;
  assert.ok(coupon);
  assert.equal(coupon.limitUses, 1);
  assert.equal(coupon.kind, "percent");
  const wrong = (
    await call("outsider", "post", `/public/stores/${slug}/orders`, {
      requestId: randomUUID(),
      customer: "Other buyer",
      address: "Address",
      city: "İzmir",
      lines: [{ productId, quantity: 1, variant: "" }],
    }).expect(201)
  ).body;
  await call(
    "outsider",
    "post",
    `/public/stores/${slug}/orders/${wrong.id}/payment`,
    { requestId: randomUUID(), couponCode: coupon.code },
  ).expect(409);
  await call(
    "outsider",
    "post",
    `/public/stores/${slug}/orders/${wrong.id}/cancel`,
    { version: wrong.version },
  ).expect(201);
});

test("global broadcasts select only verified opt-in accounts, recheck revocation and respect channel permissions", async () => {
  const before = (
    await call("buyer", "get", "/account/communication-preferences")
  ).body;
  await call("buyer", "put", "/account/communication-preferences", {
    version: before.version,
    email: true,
    sms: false,
  }).expect(200);
  const payload = {
    requestId: randomUUID(),
    subject: "Platform bulletin",
    message: "Actual opt-in broadcast",
    recipients: [accounts.buyer.id, accounts.outsider.id],
    consent: true,
  };
  const batch = (
    await call("owner", "post", "/platform/email-broadcasts", payload).expect(
      201,
    )
  ).body;
  await call("owner", "post", "/platform/email-broadcasts", payload).expect(
    201,
  );
  const notification = app.get(NotificationsService),
    db = app.get<Connection>(DATABASE);
  await notification.produceOnce();
  const deliveries = await db.models.NotificationDelivery.find({
    batchId: batch.id,
  }).lean();
  assert.equal(deliveries.length, 1);
  assert.equal(deliveries[0].customerId, accounts.buyer.id);
  const job = await db.models.IntegrationJob.findOne({
      id: deliveries[0].id,
    }).lean(),
    unsubscribeUrl = new URL(job!.input.unsubscribeUrl as string),
    token = unsubscribeUrl.searchParams.get("token");
  await api()
    .post("/api/v1/communications/unsubscribe")
    .set("Origin", origin)
    .send({ token })
    .expect(201);
  await db.models.NotificationDelivery.updateMany(
    { id: { $ne: deliveries[0].id }, status: "queued" },
    { $set: { availableAt: new Date(Date.now() + 3600000) } },
  );
  await notification.dispatchOnce();
  assert.equal(
    (await db.models.NotificationDelivery.findOne({
      id: deliveries[0].id,
    }).lean())!.status,
    "skipped",
  );
  assert.ok(!requests.has(deliveries[0].id));
  assert.equal(
    (await call("owner", "get", "/platform/email-recipients")).body.total,
    0,
  );
  await call("owner", "put", `/platform/staff/${accounts.outsider.id}`, {
    version: 3,
    role: "marketing",
    pages: ["email"],
    write: true,
    status: "active",
  }).expect(200);
  await call(
    "outsider",
    "get",
    `/platform/email-broadcasts/${batch.id}`,
  ).expect(200);
  await call("outsider", "post", "/platform/sms-broadcasts", {
    ...payload,
    requestId: randomUUID(),
  }).expect(404);
  await call("outsider", "get", `/platform/sms-broadcasts/${batch.id}`).expect(
    404,
  );
});

test("SMS opt-in needs provider phone proof, changing the phone revokes it and cancelled batches dispatch no new messages", async () => {
  let prefs = (await call("buyer", "get", "/account/communication-preferences"))
    .body;
  await call("buyer", "put", "/account/communication-preferences", {
    version: prefs.version,
    email: false,
    sms: true,
  }).expect(409);
  const profile = (await call("buyer", "get", "/auth/profile")).body;
  await call("buyer", "put", "/auth/profile", {
    version: profile.version,
    name: profile.name,
    phone: "+905551234567",
    city: "İzmir",
    bio: "",
  }).expect(200);
  const challenge = (
    await call("buyer", "post", "/account/phone-verification", {
      requestId: randomUUID(),
    }).expect(201)
  ).body;
  await dispatch(challenge.id);
  await call("outsider", "post", "/account/phone-verification/verify", {
    challengeId: challenge.id,
    requestId: randomUUID(),
    code: "123456",
  }).expect(404);
  await call("buyer", "post", "/account/phone-verification/verify", {
    challengeId: challenge.id,
    requestId: randomUUID(),
    code: "000000",
  }).expect(409);
  await call("buyer", "post", "/account/phone-verification/verify", {
    challengeId: challenge.id,
    requestId: randomUUID(),
    code: "123456",
  }).expect(201);
  prefs = (await call("buyer", "get", "/account/communication-preferences"))
    .body;
  assert.equal(prefs.phoneVerified, true);
  await call("buyer", "put", "/account/communication-preferences", {
    version: prefs.version,
    email: false,
    sms: true,
  }).expect(200);
  const batch = (
      await call("owner", "post", "/platform/sms-broadcasts", {
        requestId: randomUUID(),
        subject: "SMS bulletin",
        message: "Actual opted-in SMS",
        recipients: [accounts.buyer.id],
        consent: true,
      }).expect(201)
    ).body,
    notifications = app.get(NotificationsService),
    db = app.get<Connection>(DATABASE);
  await notifications.produceOnce();
  const delivery = (await db.models.NotificationDelivery.findOne({
    batchId: batch.id,
  }).lean())!;
  const state = (
    await call("owner", "get", `/platform/sms-broadcasts/${batch.id}`)
  ).body;
  await call("owner", "post", `/platform/email-broadcasts/${batch.id}/cancel`, {
    version: state.version,
  }).expect(404);
  await call("owner", "post", `/platform/sms-broadcasts/${batch.id}/cancel`, {
    version: state.version,
  }).expect(201);
  await db.models.NotificationDelivery.updateMany(
    { id: { $ne: delivery.id }, status: "queued" },
    { $set: { availableAt: new Date(Date.now() + 3600000) } },
  );
  await notifications.dispatchOnce();
  assert.ok(!requests.has(delivery.id));
  assert.equal(
    (await db.models.NotificationDelivery.findOne({ id: delivery.id }).lean())!
      .status,
    "skipped",
  );
  const current = (await call("buyer", "get", "/auth/profile")).body;
  await call("buyer", "put", "/auth/profile", {
    version: current.version,
    name: current.name,
    phone: "+905551234568",
    city: "İzmir",
    bio: "",
  }).expect(200);
  const revoked = (
    await call("buyer", "get", "/account/communication-preferences")
  ).body;
  assert.equal(revoked.phoneVerified, false);
  assert.equal(revoked.sms, false);
  assert.ok(revoked.version > prefs.version);
});

test("payment decline releases reservations once and a later capture is compensated without merchant income", async () => {
  const db = app.get<Connection>(DATABASE),
    beforeStock = (await db.models.Product.findOne({ id: productId }).lean())!
      .stock;
  const created = (
    await call("buyer", "post", `/public/stores/${slug}/orders`, {
      requestId: randomUUID(),
      customer: "Declined buyer",
      address: "Test Address",
      city: "İzmir",
      lines: [{ productId, quantity: 1, variant: "" }],
    }).expect(201)
  ).body;
  const payment = (
    await call(
      "buyer",
      "post",
      `/public/stores/${slug}/orders/${created.id}/payment`,
      { requestId: randomUUID() },
    ).expect(201)
  ).body;
  await dispatch(payment.id);
  await callback(
    event(payment.id, "payment.failed", payment.amountCents + 1),
  ).expect(409);
  const failed = event(payment.id, "payment.failed", payment.amountCents);
  await callback(failed).expect(201);
  await callback(failed).expect(201);
  const order = (
    await call("buyer", "get", `/public/stores/${slug}/orders/${created.id}`)
  ).body;
  assert.equal(order.shipment, "cancelled");
  assert.equal(order.cancellationReason, "payment-failed");
  assert.equal(
    (await db.models.Product.findOne({ id: productId }).lean())!.stock,
    beforeStock,
  );
  const balance = (await call("owner", "get", `/wallet/store/${slug}`)).body;
  await callback(
    event(payment.id, "payment.captured", payment.amountCents),
  ).expect(201);
  assert.deepEqual(
    (await call("owner", "get", `/wallet/store/${slug}`)).body,
    balance,
  );
  const refund = (await db.models.RefundRequest.findOne({
    paymentId: payment.id,
  }).lean())!;
  await dispatch(refund.id);
  await callback(
    event(refund.id, "refund.completed", payment.amountCents),
  ).expect(201);
  await callback(
    event(payment.id, "payment.failed", payment.amountCents),
  ).expect(201);
  assert.equal(
    (await db.models.PaymentIntent.findOne({ id: payment.id }).lean())!.status,
    "refunded",
  );
});

test("signed provider pull recovers a missing webhook and shares replay validation", async () => {
  const purchase = (
    await call("owner", "post", path("/studio/credit-purchases"), {
      requestId: randomUUID(),
      credits: 2,
    }).expect(201)
  ).body;
  await dispatch(purchase.id);
  const proof = event(purchase.id, "payment.captured", purchase.amountCents, {
    providerReference: `provider-${purchase.id}`,
  });
  pulledEvents.set(purchase.id, [proof]);
  await call(
    "buyer",
    "post",
    `/platform/integration-jobs/${purchase.id}/reconcile`,
  ).expect(404);
  const result = await call(
    "owner",
    "post",
    `/platform/integration-jobs/${purchase.id}/reconcile`,
  ).expect(201);
  assert.equal(result.body.events, 1);
  await callback(proof).expect(201);
  assert.equal(
    await app
      .get<Connection>(DATABASE)
      .models.StudioCreditLot.countDocuments({ id: purchase.id }),
    1,
  );
  await callback({ ...proof, amountCents: purchase.amountCents + 1 }).expect(
    409,
  );
  const candidateDb = app.get<Connection>(DATABASE);
  await candidateDb.models.IntegrationJob.updateOne(
    { id: purchase.id },
    { $set: { status: "awaiting", createdAt: new Date(0) } },
  );
  await app.get(CommerceService).reconcileProviderResults();
  assert.equal(
    await candidateDb.models.StudioCreditLot.countDocuments({
      id: purchase.id,
    }),
    1,
  );
});

test("unclaimed upload cleanup preserves used, private and legacy files and removes expired abandoned uploads", async () => {
  const db = app.get<Connection>(DATABASE),
    media = app.get(MediaService),
    attachments = app.get(AttachmentsService),
    buffer = await sharp({
      create: { width: 12, height: 12, channels: 3, background: "#abc" },
    })
      .png()
      .toBuffer();
  const retained = await media.upload(storeId, "product", {
      buffer,
      size: buffer.length,
    }),
    abandoned = await media.upload(storeId, "product", {
      buffer,
      size: buffer.length,
    }),
    legacy = await media.upload(storeId, "product", {
      buffer,
      size: buffer.length,
    });
  await media.assertOwned(storeId, [retained.url], "product");
  await db.models.Media.updateMany(
    { id: { $in: [retained.id, abandoned.id, legacy.id] } },
    { $set: { createdAt: new Date(0) } },
  );
  await db.models.Media.updateOne(
    { id: legacy.id },
    { $unset: { lifecycle: 1 } },
  );
  const file = {
    buffer: Buffer.from("private test"),
    size: 12,
    originalname: "proof.txt",
    mimetype: "text/plain",
  };
  const privateKept = await attachments.upload(
      storeId,
      file,
      accounts.buyer.id,
    ),
    privateLost = await attachments.upload(storeId, file, accounts.buyer.id);
  await attachments.resolve(storeId, [privateKept.id], accounts.buyer.id);
  await db.models.SupportFile.updateMany(
    { id: { $in: [privateKept.id, privateLost.id] } },
    { $set: { createdAt: new Date(0) } },
  );
  assert.ok((await media.cleanup(new Date(Date.now() - 3600000))).removed >= 1);
  assert.equal(
    (await attachments.cleanup(new Date(Date.now() - 3600000))).removed,
    1,
  );
  assert.ok((await media.read(retained.id)).length);
  assert.ok((await media.read(legacy.id)).length);
  await assert.rejects(media.read(abandoned.id));
  assert.equal(
    (await attachments.read(storeId, privateKept.id)).buffer.toString(),
    "private test",
  );
  await assert.rejects(attachments.read(storeId, privateLost.id));
  const racing = await media.upload(storeId, "product", {
    buffer,
    size: buffer.length,
  });
  await db.models.Media.updateOne(
    { id: racing.id },
    { $set: { createdAt: new Date(0) } },
  );
  const results = await Promise.allSettled([
    media.assertOwned(storeId, [racing.url], "product"),
    media.cleanup(new Date(Date.now() - 3600000)),
  ]);
  if (results[0].status === "fulfilled")
    assert.ok((await media.read(racing.id)).length);
  else await assert.rejects(media.read(racing.id));
});

test("daily sales uses bounded UTC payment confirmations, excludes pending and preserves tenant isolation", async () => {
  const db = app.get<Connection>(DATABASE),
    start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  const expected = await db.models.Order.find({
    storeId,
    payment: { $in: ["paid", "refunded"] },
    paidAt: { $gte: start, $lt: end },
  }).lean();
  const result = (
    await call("owner", "get", path("/orders/sales/daily?days=7")).expect(200)
  ).body;
  assert.equal(result.items.length, 7);
  assert.equal(result.timezone, "UTC");
  const today = result.items[6];
  assert.equal(today.date, start.toISOString().slice(0, 10));
  assert.equal(today.orders, expected.length);
  assert.equal(
    today.grossCents,
    expected.reduce((sum, order) => sum + order.totalCents, 0),
  );
  assert.equal(
    today.refundedCents,
    expected
      .filter((order) => order.payment === "refunded")
      .reduce((sum, order) => sum + order.totalCents, 0),
  );
  assert.equal(today.netCents, today.grossCents - today.refundedCents);
  await call("outsider", "get", path("/orders/sales/daily")).expect(404);
  await call("owner", "get", path("/orders/sales/daily?days=91")).expect(422);
  await call("owner", "get", "/platform/sales/daily?days=7").expect(200);
});

test("expired dispatch leases stop at their budget and the original buyer can explicitly resume the same payment job", async () => {
  const order = await buyerOrder(),
    id = randomUUID();
  await call(
    "buyer",
    "post",
    `/public/stores/${slug}/orders/${order.id}/payment`,
    { requestId: id },
  ).expect(201);
  const db = app.get<Connection>(DATABASE);
  await db.models.IntegrationJob.updateOne(
    { id },
    {
      $set: {
        status: "processing",
        attempts: 8,
        maxAttempts: 8,
        leaseId: randomUUID(),
        leaseUntil: new Date(0),
      },
    },
  );
  await app.get(JobsService).runOnce(id);
  const stopped = (await db.models.IntegrationJob.findOne({ id }).lean())!;
  assert.equal(stopped.status, "awaiting");
  assert.equal(stopped.attempts, 8);
  assert.ok(!requests.has(id));
  await call(
    "outsider",
    "post",
    `/account/integration-jobs/${id}/retry`,
  ).expect(404);
  await call("buyer", "post", `/account/integration-jobs/${id}/retry`).expect(
    201,
  );
  await dispatch(id);
  const retried = (await db.models.IntegrationJob.findOne({ id }).lean())!;
  assert.equal(retried.attempts, 9);
  assert.equal(retried.maxAttempts, 9);
  assert.equal(requests.get(id)!.calls, 1);
  const cancel = (
    await call("buyer", "get", `/public/stores/${slug}/orders/${order.id}`)
  ).body;
  await call(
    "buyer",
    "post",
    `/public/stores/${slug}/orders/${order.id}/cancel`,
    { version: cancel.version },
  ).expect(201);
});
