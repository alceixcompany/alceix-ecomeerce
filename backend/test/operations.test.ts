import { before, after, test } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { randomUUID } from "node:crypto";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";
import type { INestApplication } from "@nestjs/common";
import { createTestApp as createApp } from "./test-app";
import { loadConfig } from "../src/config/config";
import { mongoFixture } from "./mongo-fixture";
import { UsersService } from "../src/modules/users/application/users.service";
import { DATABASE } from "../src/infrastructure/database";
import type { Connection } from "mongoose";
let fixture: Awaited<ReturnType<typeof mongoFixture>>,
  app: INestApplication,
  directory: string,
  alice: string,
  bob: string,
  aliceId: string,
  slug: string,
  bobSlug: string;
const origin = "http://localhost:3000";
const api = () => request(app.getHttpServer());
const cookie = (response: request.Response) =>
  String(response.headers["set-cookie"][0]).split(";")[0];
const input = {
  name: "CRM Customer",
  email: "crm@example.com",
  phone: "+905551234567",
  city: "İstanbul",
  consent: true,
  note: "Mağaza içi not",
};
const auth = (
  method: "get" | "post" | "put",
  path: string,
  body?: object,
  session = alice,
) => {
  const operation = api()
    [method](`/api/v1${path}`)
    .set("Origin", origin)
    .set("Cookie", session);
  return body === undefined ? operation : operation.send(body);
};
const crm = (path: string) => `/stores/${slug}/crm${path}`;
const support = (path = "") => `/stores/${slug}/support${path}`;
before(async () => {
  fixture = await mongoFixture();
  directory = await mkdtemp(join(tmpdir(), "alceix-operations-"));
  app = await createApp(
    loadConfig({
      NODE_ENV: "test",
      MONGODB_URI: fixture.uri,
      FRONTEND_ORIGIN: origin,
      MEDIA_DIRECTORY: directory,
    }),
  );
  for (const [email, name] of [
    ["ops-alice@example.com", "Alice"],
    ["ops-bob@example.com", "Bob"],
  ]) {
    const response = await api()
      .post("/api/v1/auth/register")
      .set("Origin", origin)
      .send({
        email,
        name,
        password: "OperationsTest2026!",
        store: `${name} Store`,
      })
      .expect(201);
    if (name === "Alice") {
      alice = cookie(response);
      aliceId = response.body.user.id;
      slug = response.body.stores[0].slug;
    } else {
      bob = cookie(response);
      bobSlug = response.body.stores[0].slug;
    }
  }
});
after(async () => {
  await app?.close();
  await fixture?.cleanup();
  if (directory) await rm(directory, { recursive: true, force: true });
});
test("profile persists real identity, rejects stale updates, and forbids email/role assignment", async () => {
  const initial = await auth("get", "/auth/profile").expect(200);
  assert.equal(initial.body.name, "Alice");
  assert.equal(initial.body.version, 0);
  assert.equal(initial.body.phone, "");
  assert.ok(!("platformAdmin" in initial.body));
  const profile = {
    name: "Alice Updated",
    phone: "+905551111111",
    city: "İzmir",
    bio: "Gerçek profil",
    version: 0,
  };
  await auth("put", "/auth/profile", {
    ...profile,
    email: "attacker@example.com",
  }).expect(422);
  await auth("put", "/auth/profile", {
    ...profile,
    platformAdmin: true,
  }).expect(422);
  const saved = await auth("put", "/auth/profile", profile).expect(200);
  assert.equal(saved.body.version, 1);
  assert.equal(saved.body.email, "ops-alice@example.com");
  await auth("put", "/auth/profile", { ...profile, name: "Stale" }).expect(409);
  const me = await auth("get", "/auth/me").expect(200);
  assert.equal(me.body.user.name, "Alice Updated");
  assert.equal(me.body.platformAdmin, false);
  assert.equal(
    (await auth("get", "/auth/profile", undefined, bob).expect(200)).body.name,
    "Bob",
  );
});
test("contact requires consent and exact origin, persists pending requests, and remains private", async () => {
  const contact = {
    name: "Contact Person",
    email: "Contact@example.com",
    phone: "",
    store: "https://example.com",
    topic: "corporate",
    message: "Mağazam hakkında kurulum desteği almak istiyorum.",
    consent: true,
  };
  await api()
    .post("/api/v1/contact")
    .set("Origin", origin)
    .send({ ...contact, consent: false })
    .expect(422);
  await api().post("/api/v1/contact").send(contact).expect(403);
  const saved = await api()
    .post("/api/v1/contact")
    .set("Origin", origin)
    .send(contact)
    .expect(201);
  assert.equal(saved.body.status, "pending");
  assert.match(saved.body.id, /^[a-f0-9-]{36}$/);
  assert.ok(!("email" in saved.body));
  await auth("get", "/platform/contacts").expect(404);
  await api().get("/api/v1/platform/contacts").expect(401);
});
test("CRM enforces tenant/email uniqueness, validates fields and version, and prevents forged metrics", async () => {
  await api()
    .get(`/api/v1${crm("/customers")}`)
    .expect(401);
  await auth("get", crm("/customers"), undefined, bob).expect(404);
  const created = await auth("post", crm("/customers"), input).expect(201);
  assert.equal(created.body.version, 0);
  assert.ok(!("storeId" in created.body));
  await auth("post", crm("/customers"), {
    ...input,
    email: "CRM@example.com",
  }).expect(409);
  await auth("post", crm("/customers"), {
    ...input,
    email: "metrics@example.com",
    spentCents: 900000,
  }).expect(422);
  await auth("post", `/stores/${bobSlug}/crm/customers`, input, bob).expect(
    201,
  );
  const updated = await auth("put", crm(`/customers/${created.body.id}`), {
    ...input,
    note: "$literal protected",
    version: 0,
  }).expect(200);
  assert.equal(updated.body.note, "$literal protected");
  assert.equal(updated.body.version, 1);
  await auth("put", crm(`/customers/${created.body.id}`), {
    ...input,
    note: "stale",
    version: 0,
  }).expect(409);
  await auth(
    "put",
    crm(`/customers/${created.body.id}`),
    { ...input, version: 1 },
    bob,
  ).expect(404);
});
test("CRM pagination and literal search remain scoped and stable; missing metrics are explicit", async () => {
  for (let i = 0; i < 8; i++)
    await auth("post", crm("/customers"), {
      ...input,
      name: `Customer ${i}`,
      email: `customer-${i}@example.com`,
    }).expect(201);
  const first = await auth("get", crm("/customers?limit=5&page=1")).expect(200),
    second = await auth("get", crm("/customers?limit=5&page=2")).expect(200);
  assert.equal(first.body.total, 9);
  assert.equal(first.body.items.length, 5);
  assert.equal(second.body.items.length, 4);
  assert.equal(
    new Set([...first.body.items, ...second.body.items].map((c) => c.id)).size,
    9,
  );
  assert.equal(first.body.metricsAvailable, true);
  assert.equal(
    (await auth("get", crm("/customers?q=.%2A")).expect(200)).body.total,
    0,
  );
  await auth("get", crm("/customers?limit=101")).expect(422);
  await auth("get", crm("/customers?segment=vip")).expect(200);
  await auth("get", crm("/customers?q[$ne]=")).expect(422);
  assert.equal(
    (await auth("get", crm("/customers?page=999")).expect(200)).body.page,
    2,
  );
});
test("CRM settings are persistent and concurrent writes cannot overwrite one another", async () => {
  const current = await auth("get", crm("/settings")).expect(200);
  assert.equal(current.body.settings.abandonedEnabled, false);
  const result = await auth("put", crm("/settings"), {
    ...current.body,
    settings: { ...current.body.settings, delayHours: 48 },
  }).expect(200);
  assert.equal(result.body.version, 1);
  const results = await Promise.all([
    auth("put", crm("/settings"), {
      ...result.body,
      settings: { ...result.body.settings, delayHours: 12 },
    }),
    auth("put", crm("/settings"), {
      ...result.body,
      settings: { ...result.body.settings, delayHours: 24 },
    }),
  ]);
  assert.deepEqual(results.map((r) => r.status).sort(), [200, 409]);
  const persisted = await auth("get", crm("/settings")).expect(200);
  assert.equal(persisted.body.version, 2);
  await auth("put", crm("/settings"), {
    ...persisted.body,
    settings: { ...persisted.body.settings, discount: 51 },
  }).expect(422);
});
test("support persists conversations with authenticated authors, idempotent replies, and safe transitions", async () => {
  const created = await auth("post", support(), {
    channel: "platform",
    category: "Teknik",
    subject: "Gerçek destek",
    priority: "normal",
    text: "Yardım talep ediyorum.",
  }).expect(201);
  const id = created.body.id;
  assert.equal(created.body.requester, "Alice Updated");
  assert.equal(created.body.messages[0].author, "merchant");
  await auth("get", support(`/${id}`), undefined, bob).expect(404);
  const message = {
    version: 0,
    messageId: randomUUID(),
    text: "Yanıtımı kaydediyorum.",
  };
  const replied = await auth("post", support(`/${id}/replies`), message).expect(
    201,
  );
  assert.equal(replied.body.messages.length, 2);
  assert.equal(replied.body.version, 1);
  const repeated = await auth(
    "post",
    support(`/${id}/replies`),
    message,
  ).expect(201);
  assert.equal(repeated.body.messages.length, 2);
  assert.equal(repeated.body.version, 1);
  await auth("post", support(`/${id}/replies`), {
    ...message,
    text: "Different",
  }).expect(409);
  await auth("put", support(`/${id}/status`), {
    version: 1,
    status: "resolved",
  }).expect(200);
  await auth("post", support(`/${id}/replies`), {
    version: 2,
    messageId: randomUUID(),
    text: "Kapalı talep",
  }).expect(409);
  await auth("put", support(`/${id}/status`), {
    version: 1,
    status: "open",
  }).expect(409);
  await auth("put", support(`/${id}/status`), {
    version: 2,
    status: "open",
  }).expect(200);
  assert.equal(
    (
      await auth(
        "get",
        support("?status=open&channel=platform&q=Gerçek"),
      ).expect(200)
    ).body.total,
    1,
  );
  await auth("post", support(), {
    channel: "platform",
    category: "Teknik",
    subject: "Forged",
    priority: "normal",
    text: "Test",
    requester: "Another Person",
  }).expect(422);
});
test("concurrent support replies do not lose messages or exceed the recorded revision", async () => {
  const ticket = await auth("post", support(), {
    channel: "platform",
    category: "Teknik",
    subject: "Eş zamanlı",
    priority: "high",
    text: "İlk mesaj",
  }).expect(201);
  const results = await Promise.all([
    auth("post", support(`/${ticket.body.id}/replies`), {
      version: 0,
      messageId: randomUUID(),
      text: "A",
    }),
    auth("post", support(`/${ticket.body.id}/replies`), {
      version: 0,
      messageId: randomUUID(),
      text: "B",
    }),
  ]);
  assert.deepEqual(results.map((r) => r.status).sort(), [201, 409]);
  const saved = await auth("get", support(`/${ticket.body.id}`)).expect(200);
  assert.equal(saved.body.messages.length, 2);
  assert.equal(saved.body.version, 1);
});
test("support attachments normalize images, stay private, and cannot be linked across tenants", async () => {
  const png = await sharp({
    create: { width: 1800, height: 900, channels: 3, background: "red" },
  })
    .png()
    .toBuffer();
  const image = await api()
    .post(`/api/v1${support("/attachments")}`)
    .set("Origin", origin)
    .set("Cookie", alice)
    .attach("file", png, { filename: "photo.png", contentType: "image/png" })
    .expect(201);
  assert.equal(image.body.mime, "image/webp");
  const file = await api()
    .post(`/api/v1${support("/attachments")}`)
    .set("Origin", origin)
    .set("Cookie", alice)
    .attach("file", Buffer.from("Private attachment text"), {
      filename: "note.txt",
      contentType: "text/plain",
    })
    .expect(201);
  await api()
    .get(`/api/v1${support(`/attachments/${file.body.id}`)}`)
    .expect(401);
  await auth(
    "get",
    support(`/attachments/${file.body.id}`),
    undefined,
    bob,
  ).expect(404);
  await api().get(`/api/v1/media/${file.body.id}`).expect(404);
  const downloaded = await auth(
    "get",
    support(`/attachments/${file.body.id}`),
  ).expect(200);
  assert.equal(downloaded.body.toString(), "Private attachment text");
  assert.match(downloaded.headers["content-disposition"], /^attachment;/);
  assert.equal(downloaded.headers["cache-control"], "no-store");
  const ticket = await auth("post", support(), {
    channel: "platform",
    category: "Teknik",
    subject: "Dosyalı talep",
    priority: "normal",
    text: "Eklerle ilgili yardım",
  }).expect(201);
  await auth("post", support(`/${ticket.body.id}/replies`), {
    version: 0,
    messageId: randomUUID(),
    text: "",
    attachments: [file.body.id, image.body.id],
  }).expect(201);
  await auth(
    "post",
    `/stores/${bobSlug}/support/${randomUUID()}/replies`,
    {
      version: 0,
      messageId: randomUUID(),
      text: "test",
      attachments: [file.body.id],
    },
    bob,
  ).expect(404);
  const bobTicket = await auth(
    "post",
    `/stores/${bobSlug}/support`,
    {
      channel: "platform",
      category: "Teknik",
      subject: "Bob",
      priority: "normal",
      text: "Bob talebi",
    },
    bob,
  ).expect(201);
  await auth(
    "post",
    `/stores/${bobSlug}/support/${bobTicket.body.id}/replies`,
    {
      version: 0,
      messageId: randomUUID(),
      text: "Çalınan ek",
      attachments: [file.body.id],
    },
    bob,
  ).expect(404);
  await api()
    .post(`/api/v1${support("/attachments")}`)
    .set("Origin", origin)
    .set("Cookie", alice)
    .attach("file", Buffer.from("<script>alert(1)</script>"), {
      filename: "fake.pdf",
      contentType: "application/pdf",
    })
    .expect(422);
});
test("platform roles are server-managed and revocation takes effect in an existing session", async () => {
  await auth("get", "/auth/platform-access").expect(404);
  await app.get(UsersService).setPlatformAdmin(aliceId, true);
  await auth("get", "/auth/platform-access").expect(200);
  const contacts = await auth("get", "/platform/contacts").expect(200);
  assert.equal(contacts.body.total, 1);
  assert.equal(contacts.body.items[0].email, "contact@example.com");
  assert.equal(
    (await auth("get", "/platform/stores?limit=1").expect(200)).body.total,
    2,
  );
  await auth("get", "/platform/stores", undefined, bob).expect(404);
  const stores = await auth("get", "/platform/stores").expect(200);
  assert.ok(
    stores.body.items.every(
      (store: Record<string, unknown>) => !("ownerId" in store),
    ),
  );
  const aliceStore = stores.body.items.find(
    (store: { id: string; slug: string }) => store.slug === slug,
  );
  const tickets = await auth(
    "get",
    `/platform/stores/${aliceStore.id}/support`,
  ).expect(200);
  const ticket = tickets.body.items[0];
  const reply = await auth(
    "post",
    `/platform/stores/${aliceStore.id}/support/${ticket.id}/replies`,
    {
      version: ticket.version,
      messageId: randomUUID(),
      text: "Platform yanıtı",
    },
  ).expect(201);
  assert.equal(reply.body.messages.at(-1).author, "support");
  assert.equal(reply.body.status, "waiting");
  const merchant = await auth("get", support(`/${ticket.id}`)).expect(200);
  assert.equal(merchant.body.messages.at(-1).text, "Platform yanıtı");
  await app.get(UsersService).setPlatformAdmin(aliceId, false);
  await auth("get", "/platform/contacts").expect(404);
});
test("team invitations are hashed, bound to the invited account, single-use and cannot promote owners", async () => {
  const invited = await auth("post", `/stores/${slug}/team/invitations`, {
    email: "OPS-BOB@example.com",
    role: "editor",
  }).expect(201);
  assert.match(invited.body.token, /^[a-f0-9]{64}$/);
  await auth("post", `/stores/${slug}/team/invitations`, {
    email: "ops-bob@example.com",
    role: "support",
  }).expect(409);
  await auth("post", `/stores/${slug}/team/invitations`, {
    email: "ops-alice@example.com",
    role: "editor",
  }).expect(409);
  await auth("post", `/stores/${slug}/team/invitations`, {
    email: "someone@example.com",
    role: "owner",
  }).expect(422);
  const list = await auth("get", `/stores/${slug}/team`).expect(200);
  assert.equal(list.body.items.length, 2);
  assert.ok(
    list.body.items.every(
      (member: Record<string, unknown>) =>
        !("tokenHash" in member) && !("token" in member),
    ),
  );
  await auth("post", "/team/accept", { token: invited.body.token }).expect(404);
  const accepted = await auth(
    "post",
    "/team/accept",
    { token: invited.body.token },
    bob,
  ).expect(201);
  assert.equal(accepted.body.slug, slug);
  await auth("post", "/team/accept", { token: invited.body.token }, bob).expect(
    422,
  );
  assert.ok(
    (
      await auth("get", "/auth/me", undefined, bob).expect(200)
    ).body.stores.some((store: { slug: string }) => store.slug === slug),
  );
  await auth("get", `/stores/${slug}/team`, undefined, bob).expect(404);
  await auth("get", `/stores/${slug}/products`, undefined, bob).expect(200);
  await auth(
    "post",
    `/stores/${slug}/categories`,
    { name: "Team category" },
    bob,
  ).expect(201);
  await auth("get", crm("/customers"), undefined, bob).expect(404);
  await auth(
    "post",
    `/stores/${slug}/team/invitations`,
    { email: "attacker@example.com", role: "editor" },
    bob,
  ).expect(404);
});
test("team role changes and removal apply immediately to existing sessions without granting platform access", async () => {
  const list = await auth("get", `/stores/${slug}/team`).expect(200);
  const member = list.body.items.find(
    (member: { email: string }) => member.email === "ops-bob@example.com",
  );
  assert.equal(member.version, 1);
  await auth("put", `/stores/${slug}/team/${member.id}`, {
    version: 1,
    role: "viewer",
  }).expect(200);
  await auth("put", `/stores/${slug}/team/${member.id}`, {
    version: 1,
    role: "editor",
  }).expect(409);
  await auth("get", `/stores/${slug}/products`, undefined, bob).expect(200);
  await auth(
    "post",
    `/stores/${slug}/categories`,
    { name: "Denied category" },
    bob,
  ).expect(404);
  await auth("get", crm("/customers"), undefined, bob).expect(200);
  await auth(
    "post",
    crm("/customers"),
    { ...input, email: "denied@example.com" },
    bob,
  ).expect(404);
  await auth("put", `/stores/${slug}/team/${member.id}`, {
    version: 2,
    role: "support",
  }).expect(200);
  await auth(
    "post",
    crm("/customers"),
    { ...input, email: "support-created@example.com" },
    bob,
  ).expect(201);
  await auth(
    "post",
    support(),
    {
      channel: "platform",
      category: "Destek",
      subject: "Team support",
      priority: "normal",
      text: "Ekip destek talebi",
    },
    bob,
  ).expect(201);
  await auth("get", `/stores/${slug}/products`, undefined, bob).expect(404);
  await auth("get", "/auth/platform-access", undefined, bob).expect(404);
  await auth("post", `/stores/${slug}/team/owner/revoke`, {
    version: 0,
  }).expect(422);
  await auth("post", `/stores/${slug}/team/${member.id}/revoke`, {
    version: 3,
  }).expect(201);
  await auth("get", crm("/customers"), undefined, bob).expect(404);
  await auth("get", `/stores/${slug}`, undefined, bob).expect(404);
  assert.ok(
    !(
      await auth("get", "/auth/me", undefined, bob).expect(200)
    ).body.stores.some((store: { slug: string }) => store.slug === slug),
  );
});
test("expired and revoked invitations never grant access, and quota is atomic at the last seat", async () => {
  const expired = await auth("post", `/stores/${slug}/team/invitations`, {
    email: "ops-bob@example.com",
    role: "viewer",
  }).expect(201);
  const { DATABASE } = await import("../src/infrastructure/database");
  const { StoresService } =
    await import("../src/modules/stores/application/stores.service");
  const db = app.get<import("mongoose").Connection>(DATABASE);
  await db
    .model("StoreMembership")
    .updateOne(
      { id: expired.body.id },
      { $set: { expiresAt: new Date(Date.now() - 1000) } },
    );
  await auth("post", "/team/accept", { token: expired.body.token }, bob).expect(
    422,
  );
  await auth("post", `/stores/${slug}/team/${expired.body.id}/revoke`, {
    version: 0,
  }).expect(201);
  await auth("post", "/team/accept", { token: expired.body.token }, bob).expect(
    422,
  );
  for (let i = 0; i < 48; i++)
    await auth("post", `/stores/${slug}/team/invitations`, {
      email: `quota-${i}@example.com`,
      role: "viewer",
    }).expect(201);
  const attempts = await Promise.all([
    auth("post", `/stores/${slug}/team/invitations`, {
      email: "quota-last-a@example.com",
      role: "viewer",
    }),
    auth("post", `/stores/${slug}/team/invitations`, {
      email: "quota-last-b@example.com",
      role: "viewer",
    }),
  ]);
  assert.deepEqual(attempts.map((result) => result.status).sort(), [201, 422]);
  assert.equal(
    (await auth("get", `/stores/${slug}/team`).expect(200)).body.items.length,
    50,
  );
  const store = await app.get(StoresService).publicBySlug(slug);
  const counter = await db
    .model<{ storeId: string; count: number }>("StoreTeamQuota")
    .findOne({ storeId: store.id })
    .lean();
  assert.equal(counter?.count, 49);
});

test("communication drafts are tenant scoped, durable, idempotent and versioned without sending mail", async () => {
  const requestId = randomUUID(),
    draft = {
      kind: "email",
      segment: "all",
      subject: "Kayıtlı taslak",
      message: "Merhaba {{ad}}",
      requestId,
    };
  const created = await auth("post", crm("/communications"), draft).expect(201);
  assert.ok(!("storeId" in created.body));
  assert.ok(!("requestId" in created.body));
  assert.equal(created.body.version, 0);
  const repeated = await auth("post", crm("/communications"), draft).expect(
    201,
  );
  assert.equal(repeated.body.id, created.body.id);
  await auth("post", crm("/communications"), {
    ...draft,
    message: "Different payload",
  }).expect(409);
  const list = await auth(
    "get",
    crm("/communications?kind=email&limit=1&page=999"),
  ).expect(200);
  assert.equal(list.body.total, 1);
  assert.equal(list.body.page, 1);
  assert.equal(list.body.items[0].id, created.body.id);
  const edit = {
    kind: "email",
    segment: "all",
    subject: "Güncel konu",
    message: "$literal content",
    version: 0,
  };
  const changes = await Promise.all([
    auth("put", crm(`/communications/${created.body.id}`), edit),
    auth("put", crm(`/communications/${created.body.id}`), edit),
  ]);
  assert.deepEqual(changes.map((r) => r.status).sort(), [200, 409]);
  await auth(
    "put",
    `/stores/${bobSlug}/crm/communications/${created.body.id}`,
    edit,
    bob,
  ).expect(409);
  await auth("post", crm("/communications"), {
    ...draft,
    requestId: randomUUID(),
    recipients: ["forged@example.com"],
  }).expect(422);
  await auth("post", crm("/communications"), {
    ...draft,
    kind: "campaign",
    message: "x".repeat(501),
    requestId: randomUUID(),
  }).expect(422);
  const concurrent = {
    kind: "campaign",
    segment: "vip",
    subject: "",
    message: "İlk kampanya",
    requestId: randomUUID(),
  };
  const responses = await Promise.all([
    auth("post", crm("/communications"), concurrent),
    auth("post", crm("/communications"), concurrent),
  ]);
  assert.deepEqual(
    responses.map((r) => r.status),
    [201, 201],
  );
  assert.equal(responses[0].body.id, responses[1].body.id);
});

test("communication audience counts all consented records, bounds previews and never invents metric segments", async () => {
  const initial = await auth(
    "get",
    crm("/communication-recipients?segment=all"),
  ).expect(200);
  for (let index = 0; index < 12; index++)
    await auth("post", crm("/customers"), {
      ...input,
      name: `Audience ${index}`,
      email: `audience-${index}@example.com`,
      consent: index !== 11,
    }).expect(201);
  const audience = await auth(
    "get",
    crm("/communication-recipients?segment=all"),
  ).expect(200);
  assert.equal(audience.body.total, initial.body.total + 11);
  assert.equal(audience.body.items.length, 10);
  assert.ok(audience.body.items.every((c: { consent: boolean }) => c.consent));
  const unavailable = await auth(
    "get",
    crm("/communication-recipients?segment=cart"),
  ).expect(200);
  assert.equal(unavailable.body.available, true);
  assert.equal(unavailable.body.total, 0);
  assert.deepEqual(unavailable.body.items, []);
  const other = await auth(
    "get",
    `/stores/${bobSlug}/crm/communication-recipients?segment=all`,
    undefined,
    bob,
  ).expect(200);
  assert.ok(
    other.body.items.every(
      (customer: { email: string }) => !customer.email.startsWith("audience-"),
    ),
  );
});

test("platform support lists only platform tickets and downloads only attachments linked to that ticket", async () => {
  const users = app.get(UsersService);
  await users.setPlatformAdmin(aliceId, true);
  try {
    const ticket = await auth("post", support(), {
      channel: "platform",
      category: "Diğer",
      subject: "Platform attachment authorization",
      priority: "normal",
      text: "Private file",
    }).expect(201);
    const upload = await api()
      .post(`/api/v1${support("/attachments")}`)
      .set("Origin", origin)
      .set("Cookie", alice)
      .attach("file", Buffer.from("Platform-only private attachment"), {
        filename: "private.txt",
        contentType: "text/plain",
      })
      .expect(201);
    const path = `/platform/stores/${(await auth("get", "/auth/me")).body.stores.find((s: { slug: string }) => s.slug === slug).id}/support/${ticket.body.id}`;
    await auth("get", `${path}/attachments/${upload.body.id}`).expect(404);
    await auth("post", support(`/${ticket.body.id}/replies`), {
      version: 0,
      messageId: randomUUID(),
      text: "File attached",
      attachments: [upload.body.id],
    }).expect(201);
    await auth("get", `${path}/attachments/${upload.body.id}`).expect(200);
    await auth(
      "get",
      `${path}/attachments/${upload.body.id}`,
      undefined,
      bob,
    ).expect(404);
    const list = await auth(
      "get",
      "/platform/support?limit=1&page=9999",
    ).expect(200);
    assert.equal(list.body.items.length, 1);
    assert.equal(list.body.items[0].channel, "platform");
    assert.equal(list.body.page, list.body.pages);
    assert.ok(list.body.items[0].storeId);
    const search = await auth(
      "get",
      `/platform/support?q=${ticket.body.id}&limit=8`,
    ).expect(200);
    assert.equal(search.body.total, 1);
    assert.equal(search.body.items[0].id, ticket.body.id);
  } finally {
    await users.setPlatformAdmin(aliceId, false);
  }
  await auth("get", "/platform/support").expect(404);
});

test("support reply drafts are private per actor, versioned, and matching drafts clear atomically with sending", async () => {
  const created = await auth("post", support(), {
      channel: "platform",
      category: "Diğer",
      subject: "Durable reply draft",
      priority: "normal",
      text: "Draft test",
    }).expect(201),
    id = created.body.id;
  const path = support(`/${id}/draft`);
  const empty = await auth("get", path).expect(200);
  assert.equal(empty.body.version, 0);
  const input = { version: 0, text: "Kalıcı yanıt taslağı", attachments: [] };
  const responses = await Promise.all([
    auth("put", path, input),
    auth("put", path, input),
  ]);
  assert.deepEqual(responses.map((r) => r.status).sort(), [200, 409]);
  const persisted = await auth("get", path).expect(200);
  assert.equal(persisted.body.version, 1);
  assert.equal(persisted.body.text, input.text);
  await auth("put", path, { ...input, userId: aliceId }).expect(422);
  const team = await auth("get", `/stores/${slug}/team`);
  const seat = team.body.items.find(
    (member: { role: string }) => member.role !== "owner",
  );
  await auth("post", `/stores/${slug}/team/${seat.id}/revoke`, {
    version: seat.version,
  }).expect(201);
  const invitation = await auth("post", `/stores/${slug}/team/invitations`, {
    email: "ops-bob@example.com",
    role: "support",
  }).expect(201);
  await auth(
    "post",
    "/team/accept",
    { token: invitation.body.token },
    bob,
  ).expect(201);
  const otherActor = await auth("get", path, undefined, bob).expect(200);
  assert.equal(otherActor.body.text, "");
  assert.equal(otherActor.body.version, 0);

  await auth(
    "get",
    `/stores/${bobSlug}/support/${id}/draft`,
    undefined,
    bob,
  ).expect(404);
  await auth("post", support(`/${id}/replies`), {
    version: 0,
    messageId: randomUUID(),
    text: input.text,
    attachments: [],
  }).expect(201);
  const cleared = await auth("get", path).expect(200);
  assert.equal(cleared.body.text, "");
  assert.equal(cleared.body.version, 2);
  await auth("put", path, { ...input, version: 1 }).expect(409);
  await auth("put", path, {
    ...input,
    version: 2,
    text: "Farklı kaydedilen taslak",
  }).expect(200);
  await auth("post", support(`/${id}/replies`), {
    version: 1,
    messageId: randomUUID(),
    text: "Diğer sekmeden yanıt",
    attachments: [],
  }).expect(201);
  assert.equal((await auth("get", path)).body.text, "Farklı kaydedilen taslak");
});

test("concurrent first invitations initialize one quota without rejecting available seats", async () => {
  const attempts = await Promise.all(
    ["first-quota-a@example.com", "first-quota-b@example.com"].map((email) =>
      auth(
        "post",
        `/stores/${bobSlug}/team/invitations`,
        { email, role: "viewer" },
        bob,
      ),
    ),
  );
  assert.deepEqual(
    attempts.map((response) => response.status),
    [201, 201],
  );
  assert.equal(
    (await auth("get", `/stores/${bobSlug}/team`, undefined, bob)).body.items
      .length,
    3,
  );
});

test("profile updates accept the same name length as registration without forcing identity truncation", async () => {
  const name = "A".repeat(100),
    registered = await api()
      .post("/api/v1/auth/register")
      .set("Origin", origin)
      .send({
        name,
        email: "long-profile-name@example.com",
        password: "OperationsTest2026!",
        store: "Long Name Store",
      })
      .expect(201),
    session = cookie(registered);
  const profile = await auth("get", "/auth/profile", undefined, session).expect(
    200,
  );
  assert.equal(profile.body.name, name);
  const saved = await auth(
    "put",
    "/auth/profile",
    { name, phone: "", city: "İzmir", bio: "", version: 0 },
    session,
  ).expect(200);
  assert.equal(saved.body.name, name);
  assert.equal(saved.body.city, "İzmir");
  await auth(
    "put",
    "/auth/profile",
    {
      name: name + "A",
      phone: "",
      city: "İzmir",
      bio: "",
      version: saved.body.version,
    },
    session,
  ).expect(422);
});

test("creation retries compare immutable communication input after edits, including legacy drafts", async () => {
  for (const legacy of [false, true]) {
    const input = {
      requestId: randomUUID(),
      kind: "email",
      segment: "all",
      subject: "Original subject",
      message: "Original content",
    };
    const created = await auth("post", crm("/communications"), input).expect(
      201,
    );
    if (legacy)
      await app
        .get<Connection>(DATABASE)
        .model("CrmCommunicationDraft")
        .updateOne({ id: created.body.id }, { $unset: { initialInput: 1 } });
    const edited = await auth(
      "put",
      crm(`/communications/${created.body.id}`),
      {
        kind: input.kind,
        segment: "new",
        subject: "Edited subject",
        message: "$literal edited content",
        version: 0,
      },
    ).expect(200);
    const replay = await auth("post", crm("/communications"), input).expect(
      201,
    );
    assert.equal(replay.body.id, created.body.id);
    assert.equal(replay.body.version, edited.body.version);
    assert.equal(replay.body.message, edited.body.message);
    assert.ok(!("initialInput" in replay.body));
    await auth("post", crm("/communications"), {
      ...input,
      message: edited.body.message,
    }).expect(409);
    const listed = await auth("get", crm("/communications?kind=email")).expect(
      200,
    );
    assert.ok(
      listed.body.items.every((draft: object) => !("initialInput" in draft)),
    );
  }
});

test("support reply retries belong to the authenticated author even after a name change", async () => {
  const ticket = await auth("post", support(), {
    channel: "platform",
    category: "Diğer",
    subject: "Actor scoped retries",
    priority: "normal",
    text: "First message",
  }).expect(201);
  const reply = {
    version: 0,
    messageId: randomUUID(),
    text: "Owner reply",
    attachments: [],
  };
  await auth("post", support(`/${ticket.body.id}/replies`), reply).expect(201);
  await auth("post", support(`/${ticket.body.id}/replies`), reply, bob).expect(
    409,
  );
  const profile = await auth("get", "/auth/profile").expect(200);
  await auth("put", "/auth/profile", {
    name: "Renamed Owner",
    phone: profile.body.phone,
    city: profile.body.city,
    bio: profile.body.bio,
    version: profile.body.version,
  }).expect(200);
  const retried = await auth(
    "post",
    support(`/${ticket.body.id}/replies`),
    reply,
  ).expect(201);
  assert.equal(retried.body.messages.length, 2);
  assert.ok(
    retried.body.messages.every((message: object) => !("actorId" in message)),
  );
});

test("store settings and drafts cannot claim recovery or invitation page addresses", async () => {
  const store = await auth("get", `/stores/${slug}`).expect(200);
  const { id: _id, ...settings } = store.body;
  for (const reserved of ["sifremi-unuttum", "sifre-sifirla", "ekip-daveti"])
    for (const route of ["settings", "settings/draft"])
      await auth("put", `/stores/${slug}/${route}`, {
        ...settings,
        slug: reserved,
      }).expect(409);
  const unchanged = await auth("get", `/stores/${slug}`).expect(200);
  assert.equal(unchanged.body.slug, slug);
  assert.equal(unchanged.body.version, store.body.version);
});
