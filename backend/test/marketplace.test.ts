import { PartnerTeamService } from "../src/modules/partners/application/partner-team.service";
import { PartnersService } from "../src/modules/partners/application/partners.service";
import { DATABASE } from "../src/infrastructure/database";
import type { Connection } from "mongoose";
import { before, after, test } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { randomUUID } from "node:crypto";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { INestApplication } from "@nestjs/common";
import { createTestApp as createApp } from "./test-app";
import { loadConfig } from "../src/config/config";
import { UsersService } from "../src/modules/users/application/users.service";
import { mongoFixture } from "./mongo-fixture";
let fixture: Awaited<ReturnType<typeof mongoFixture>>,
  app: INestApplication,
  directory: string;
const origin = "http://localhost:3000",
  accounts: Record<string, { cookie: string; id: string; slug?: string }> = {};
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
let supplierId: string,
  creatorId: string,
  secondCreatorId: string,
  linkId: string,
  _storeId: string;
async function approve(who: string, kind: "supplier" | "influencer") {
  const payload =
    kind === "supplier"
      ? {
          companyName: "Actual Supplier",
          contact: "supplier@example.com",
          category: "Giyim",
        }
      : {
          name: "Actual Creator",
          profile: "@actual",
          followers: "100",
          category: "Moda",
        };
  const submitted = await call(
    who,
    "post",
    `/applications/account/${kind}`,
    payload,
  ).expect(201);
  const approved = await call(
    "staff",
    "post",
    `/platform/applications/${submitted.body.id}/decision`,
    { version: 0, status: "approved", reason: "Reviewed" },
  ).expect(201);
  return approved.body.partner;
}
before(async () => {
  fixture = await mongoFixture();
  directory = await mkdtemp(join(tmpdir(), "alceix-marketplace-"));
  app = await createApp(
    loadConfig({
      NODE_ENV: "test",
      MONGODB_URI: fixture.uri,
      FRONTEND_ORIGIN: origin,
      MEDIA_DIRECTORY: directory,
    }),
  );
  for (const who of [
    "staff",
    "merchant",
    "supplier",
    "creator",
    "creator2",
    "outsider",
  ]) {
    const registered = await api()
      .post("/api/v1/auth/register")
      .set("Origin", origin)
      .send({
        name: who,
        email: `${who}-marketplace@example.com`,
        password: "Marketplace2026!",
        ...(who === "merchant" ? { store: "Marketplace Merchant" } : {}),
      })
      .expect(201);
    accounts[who] = {
      cookie: String(registered.headers["set-cookie"][0]).split(";")[0],
      id: registered.body.user.id,
      slug: registered.body.stores[0]?.slug,
    };
  }
  await app.get(UsersService).setPlatformAdmin(accounts.staff.id, true);
  _storeId = (
    await call("merchant", "get", `/stores/${accounts.merchant.slug}`)
  ).body.id;
});
after(async () => {
  await app?.close();
  await fixture?.cleanup();
  if (directory) await rm(directory, { recursive: true, force: true });
});
test("partner applications do not grant access; only reviewed accounts own approved profiles", async () => {
  const submitted = await call(
    "supplier",
    "post",
    "/applications/account/supplier",
    {
      companyName: "Actual Supplier",
      contact: "supplier@example.com",
      category: "Giyim",
    },
  ).expect(201);
  assert.deepEqual(
    (await call("supplier", "get", "/account/partners")).body,
    [],
  );
  await call(
    "merchant",
    "post",
    `/platform/applications/${submitted.body.id}/decision`,
    { version: 0, status: "approved", reason: "Reviewed" },
  ).expect(404);
  const approved = await call(
    "staff",
    "post",
    `/platform/applications/${submitted.body.id}/decision`,
    { version: 0, status: "approved", reason: "Reviewed" },
  ).expect(201);
  supplierId = approved.body.partner.id;
  assert.equal(approved.body.partner.ownerId, accounts.supplier.id);
  await call("outsider", "get", `/partners/${supplierId}`).expect(404);
  const publicRead = (
    await call(
      "outsider",
      "get",
      `/public/partners/${approved.body.partner.slug}`,
    )
  ).body;
  assert.ok(!("ownerId" in publicRead));
  assert.ok(!("applicationId" in publicRead));
  const replay = await call(
    "staff",
    "post",
    `/platform/applications/${submitted.body.id}/decision`,
    { version: 0, status: "approved", reason: "Reviewed" },
  ).expect(201);
  assert.equal(replay.body.partner.id, supplierId);
  const profile = {
    version: 0,
    name: "Updated Supplier",
    bio: "Actual profile",
    city: "İzmir",
    category: "Giyim",
    logo: "",
    links: [],
    portfolio: [],
  };
  await call(
    "supplier",
    "put",
    `/partners/${supplierId}/profile`,
    profile,
  ).expect(200);
  await call(
    "supplier",
    "put",
    `/partners/${supplierId}/profile`,
    profile,
  ).expect(409);
  creatorId = (await approve("creator", "influencer")).id;
  secondCreatorId = (await approve("creator2", "influencer")).id;
});
test("shared relationships require the other participant's consent; message retries are scoped to author and thread", async () => {
  const requested = await call(
    "merchant",
    "post",
    `/stores/${accounts.merchant.slug}/partners`,
    { partnerId: creatorId },
  ).expect(201);
  linkId = requested.body.id;
  await call("merchant", "post", `/links/${linkId}/transition`, {
    version: 0,
    action: "accept",
  }).expect(409);
  await call("outsider", "get", `/links/${linkId}/messages`).expect(404);
  await call("creator", "post", `/links/${linkId}/transition`, {
    version: 0,
    action: "accept",
  }).expect(201);
  const message = {
    messageId: randomUUID(),
    text: "Actual shared conversation",
  };
  await call("merchant", "post", `/links/${linkId}/messages`, message).expect(
    201,
  );
  await call("merchant", "post", `/links/${linkId}/messages`, message).expect(
    201,
  );
  await call("creator", "post", `/links/${linkId}/messages`, message).expect(
    409,
  );
  const messages = (await call("creator", "get", `/links/${linkId}/messages`))
    .body;
  assert.equal(messages.total, 1);
  assert.ok(!("actorId" in messages.items[0]));
});
test("offer acceptance, creator delivery and merchant confirmation enforce independent roles and stale versions", async () => {
  const terms = {
    requestId: randomUUID(),
    title: "Real campaign",
    brief: "Actual brief",
    deliverables: "One video",
    deadline: "2030-12-31",
    kind: "gift",
    feeCents: 0,
  };
  const created = await call(
    "merchant",
    "post",
    `/links/${linkId}/offers`,
    terms,
  ).expect(201);
  await call("merchant", "post", `/offers/${created.body.id}/transition`, {
    version: 0,
    action: "accept",
  }).expect(409);
  await call("creator", "post", `/offers/${created.body.id}/transition`, {
    version: 0,
    action: "accept",
  }).expect(201);
  await call("creator", "post", `/offers/${created.body.id}/transition`, {
    version: 0,
    action: "submit",
    contentUrl: "https://example.com/video",
  }).expect(409);
  await call("creator", "post", `/offers/${created.body.id}/transition`, {
    version: 1,
    action: "submit",
    contentUrl: "https://example.com/video",
    report: "Submitted",
  }).expect(201);
  await call("creator", "post", `/offers/${created.body.id}/transition`, {
    version: 2,
    action: "complete",
  }).expect(409);
  const completed = await call(
    "merchant",
    "post",
    `/offers/${created.body.id}/transition`,
    { version: 2, action: "complete" },
  ).expect(201);
  assert.equal(completed.body.status, "completed");
  const audit = (
    await call("merchant", "get", `/stores/${accounts.merchant.slug}/audit`)
  ).body;
  assert.ok(
    audit.items.some(
      (entry: { action: string }) => entry.action === "offer.complete",
    ),
  );
});
test("campaign last-slot selection is transactional and cannot be overbooked", async () => {
  const created = await call(
    "merchant",
    "post",
    `/stores/${accounts.merchant.slug}/campaigns`,
    {
      title: "Capacity test",
      brief: "Actual campaign",
      format: "Video",
      budgetCents: 500000,
      deadline: "2030-12-31",
      slots: 1,
    },
  ).expect(201);
  const first = await call(
      "creator",
      "post",
      `/campaigns/${created.body.id}/applications`,
      { partnerId: creatorId, note: "First" },
    ).expect(201),
    second = await call(
      "creator2",
      "post",
      `/campaigns/${created.body.id}/applications`,
      { partnerId: secondCreatorId, note: "Second" },
    ).expect(201);
  const responses = await Promise.all(
    [first, second].map((application) =>
      call(
        "merchant",
        "post",
        `/stores/${accounts.merchant.slug}/campaign-applications/${application.body.id}/decision`,
        { version: 0, status: "accepted" },
      ),
    ),
  );
  assert.deepEqual(responses.map((r) => r.status).sort(), [201, 409]);
  assert.equal(
    (
      await call(
        "merchant",
        "get",
        `/stores/${accounts.merchant.slug}/campaigns/${created.body.id}/applications`,
      )
    ).body.items.filter(
      (application: { status: string }) => application.status === "accepted",
    ).length,
    1,
  );
});
test("campaign withdrawal releases a selected slot and closed links require renewed reciprocal acceptance", async () => {
  const root = `/stores/${accounts.merchant.slug}`;
  const campaign = (
    await call("merchant", "post", `${root}/campaigns`, {
      title: "Withdrawal flow",
      brief: "Brief",
      format: "Video",
      budgetCents: 1000,
      deadline: "2030-12-31",
      slots: 1,
    }).expect(201)
  ).body;
  const app1 = (
    await call("creator", "post", `/campaigns/${campaign.id}/applications`, {
      partnerId: creatorId,
      note: "Apply",
    }).expect(201)
  ).body;
  const selected = (
    await call(
      "merchant",
      "post",
      `${root}/campaign-applications/${app1.id}/decision`,
      { version: 0, status: "accepted" },
    ).expect(201)
  ).body;
  await call(
    "creator2",
    "post",
    `/partners/${creatorId}/campaign-applications/${app1.id}/withdraw`,
    { version: selected.version },
  ).expect(404);
  await call(
    "creator",
    "post",
    `/partners/${creatorId}/campaign-applications/${app1.id}/withdraw`,
    { version: selected.version },
  ).expect(201);
  await call(
    "creator",
    "post",
    `/partners/${creatorId}/campaign-applications/${app1.id}/withdraw`,
    { version: selected.version },
  ).expect(201);
  assert.ok(
    (
      await call(
        "creator",
        "get",
        `/partners/${creatorId}/campaign-applications`,
      )
    ).body.items.some(
      (item: { id: string; status: string }) =>
        item.id === app1.id && item.status === "withdrawn",
    ),
  );
  const app2 = (
    await call("creator2", "post", `/campaigns/${campaign.id}/applications`, {
      partnerId: secondCreatorId,
      note: "Second",
    }).expect(201)
  ).body;
  await call(
    "merchant",
    "post",
    `${root}/campaign-applications/${app2.id}/decision`,
    { version: 0, status: "accepted" },
  ).expect(201);
  const link = (
    await call("merchant", "get", `${root}/partners`)
  ).body.items.find((l: { id: string }) => l.id === linkId);
  const closed = (
    await call("merchant", "post", `/links/${linkId}/transition`, {
      version: link.version,
      action: "close",
    }).expect(201)
  ).body;
  const pending = (
    await call("merchant", "post", `/links/${linkId}/transition`, {
      version: closed.version,
      action: "reopen",
    }).expect(201)
  ).body;
  await call("merchant", "post", `/links/${linkId}/transition`, {
    version: pending.version,
    action: "accept",
  }).expect(409);
  await call("creator", "post", `/links/${linkId}/transition`, {
    version: pending.version,
    action: "accept",
  }).expect(201);
});
test("partner teams enforce real capability boundaries, invitation ownership and immediate pause/revocation", async () => {
  const id = supplierId,
    teamRoot = `/partners/${id}/team`;
  const invited = (
    await call("supplier", "post", `${teamRoot}/invitations`, {
      email: "outsider-marketplace@example.com",
      role: "operations",
    }).expect(201)
  ).body;
  const db = app.get<Connection>(DATABASE),
    record = (await db.models.PartnerMembership.findOne({
      id: invited.id,
    }).lean())!;
  assert.ok(record.tokenHash);
  assert.notEqual(record.tokenHash, invited.token);
  assert.ok(!("token" in record));
  await call("creator", "post", "/account/partner-team-invitations/accept", {
    token: invited.token,
  }).expect(404);
  await call("outsider", "post", "/account/partner-team-invitations/accept", {
    token: invited.token,
  }).expect(201);
  await call("outsider", "post", "/account/partner-team-invitations/accept", {
    token: invited.token,
  }).expect(422);
  const catalogInput = {
    name: "Team created draft",
    sku: randomUUID(),
    category: "Test",
    description: "",
    priceCents: 1000,
    stock: 5,
    minimum: 1,
    images: [],
    active: false,
  };
  await call(
    "outsider",
    "post",
    `/partners/${id}/products`,
    catalogInput,
  ).expect(201);
  await call("outsider", "get", `/partners/${id}`).expect(200);
  await call("outsider", "get", `/partners/${creatorId}`).expect(404);
  assert.ok(
    (await call("outsider", "get", "/account/partners")).body.some(
      (p: { id: string }) => p.id === id,
    ),
  );
  await call("outsider", "get", `/wallet/partner/${id}`).expect(404);
  await call("outsider", "post", `${teamRoot}/invitations`, {
    email: "other@example.com",
    role: "viewer",
  }).expect(404);
  const item = (await call("supplier", "get", teamRoot)).body.items.find(
    (m: { id: string }) => m.id === invited.id,
  );
  await call("supplier", "put", `${teamRoot}/${item.id}/status`, {
    version: item.version,
    status: "paused",
  }).expect(200);
  await call("outsider", "get", `/partners/${id}`).expect(404);
  await call("supplier", "put", `${teamRoot}/${item.id}/role`, {
    version: item.version + 1,
    role: "finance",
  }).expect(200);
  await call("supplier", "put", `${teamRoot}/${item.id}/status`, {
    version: item.version + 2,
    status: "active",
  }).expect(200);
  await call("outsider", "get", `/wallet/partner/${id}`).expect(200);
  await call("outsider", "post", `/wallet/partner/${id}/bank/verify`, {
    requestId: randomUUID(),
    version: 0,
    owner: "Outsider",
    iban: "TR330006100519786457841326",
  }).expect(404);
  await call("outsider", "post", `/partners/${id}/products`, {
    ...catalogInput,
    sku: randomUUID(),
  }).expect(404);
  const caps = (await call("outsider", "get", `/partners/${id}/capabilities`))
    .body;
  assert.ok(caps.capabilities.includes("finance-read"));
  assert.ok(!caps.capabilities.includes("catalog-write"));
  const second = (
    await call("supplier", "post", `${teamRoot}/invitations`, {
      email: "creator2-marketplace@example.com",
      role: "support",
    }).expect(201)
  ).body;
  const renewed = (
    await call("supplier", "post", `${teamRoot}/${second.id}/reissue`, {
      version: 0,
    }).expect(201)
  ).body;
  await call("creator2", "post", "/account/partner-team-invitations/accept", {
    token: second.token,
  }).expect(422);
  await call("creator2", "post", "/account/partner-team-invitations/accept", {
    token: renewed.token,
  }).expect(201);
});

test("partner platform tickets persist real replies, stay tenant-private and support-role members can resolve them", async () => {
  const root = `/partners/${supplierId}/support`;
  const ticket = (
    await call("supplier", "post", root, {
      category: "Operations",
      subject: "Actual supplier request",
      priority: "high",
      text: "Can you review my shipment?",
    }).expect(201)
  ).body;
  assert.equal(ticket.scopeKind, "partner");
  await call("creator", "get", `${root}/${ticket.id}`).expect(404);
  await call("outsider", "post", root, {
    category: "Operations",
    subject: "Forbidden",
    priority: "normal",
    text: "No support permission",
  }).expect(404);
  await call("creator2", "get", `${root}/${ticket.id}`).expect(200);
  await call(
    "staff",
    "post",
    `/platform/partners/${supplierId}/support/${ticket.id}/replies`,
    { version: 0, messageId: randomUUID(), text: "Actual platform reply" },
  ).expect(201);
  const replied = (await call("supplier", "get", `${root}/${ticket.id}`)).body;
  assert.equal(replied.messages[1].author, "support");
  assert.equal(replied.messages[1].text, "Actual platform reply");
  await call("creator2", "put", `${root}/${ticket.id}/status`, {
    version: replied.version,
    status: "resolved",
  }).expect(200);
  const closed = (await call("supplier", "get", `${root}/${ticket.id}`)).body;
  assert.equal(closed.status, "resolved");
  await call("supplier", "post", `${root}/${ticket.id}/replies`, {
    version: closed.version,
    messageId: randomUUID(),
    text: "Closed reply",
  }).expect(409);
  const selected = (
    await call("supplier", "get", `/partners/${supplierId}/team`)
  ).body.items.find(
    (m: { email: string }) => m.email === "creator2-marketplace@example.com",
  );
  await request(app.getHttpServer())
    .delete(`/api/v1/partners/${supplierId}/team/${selected.id}`)
    .set("Origin", origin)
    .set("Cookie", accounts.supplier.cookie)
    .send({ version: selected.version })
    .expect(200);
  await call("creator2", "get", `${root}/${ticket.id}`).expect(404);
});
test("partner invitation quota stays bounded when two requests compete for the final place", async () => {
  const partner = await app
      .get(PartnersService)
      .owner(supplierId, accounts.supplier.id),
    team = app.get(PartnerTeamService),
    db = app.get<Connection>(DATABASE);
  const count = await db.models.PartnerMembership.countDocuments({
    partnerId: supplierId,
  });
  for (let index = count; index < 98; index++)
    await team.invite(partner, `quota-${index}@example.com`, "viewer");
  const results = await Promise.all(
    [0, 1].map((i) =>
      call("supplier", "post", `/partners/${supplierId}/team/invitations`, {
        email: `final-${i}@example.com`,
        role: "viewer",
      }),
    ),
  );
  assert.deepEqual(results.map((r) => r.status).sort(), [201, 422]);
  assert.equal(
    await db.models.PartnerMembership.countDocuments({ partnerId: supplierId }),
    99,
  );
  assert.equal(
    (await call("supplier", "get", `/partners/${supplierId}/team`)).body.items
      .length,
    100,
  );
});
test("supplier catalogue is private for writes, exposes only active products and checks physical capacity", async () => {
  const body = {
    name: "Actual Supply Product",
    sku: "SUP-1",
    category: "Giyim",
    description: "",
    priceCents: 25000,
    stock: 5,
    minimum: 2,
    images: ["/dropshipping/cardigan.jpg"],
    active: true,
  };
  await call(
    "outsider",
    "post",
    `/partners/${supplierId}/products`,
    body,
  ).expect(404);
  const created = await call(
    "supplier",
    "post",
    `/partners/${supplierId}/products`,
    body,
  ).expect(201);
  await call(
    "supplier",
    "put",
    `/partners/${supplierId}/products/${created.body.id}`,
    { ...body, version: 0, active: false },
  ).expect(200);
  const partner = (await call("supplier", "get", `/partners/${supplierId}`))
    .body;
  assert.equal(
    (await call("outsider", "get", `/public/partners/${partner.slug}/products`))
      .body.total,
    0,
  );
  await call("staff", "put", `/platform/partners/${supplierId}/status`, {
    version: 1,
    status: "suspended",
  }).expect(200);
  await call("supplier", "get", `/partners/${supplierId}`).expect(404);
  await call("outsider", "get", `/public/partners/${partner.slug}`).expect(404);
});

test("completed collaboration reviews are moderated and share one public rating source", async () => {
  const offers = (await call("merchant", "get", `/links/${linkId}/offers`)).body
    .items;
  const source = offers.find(
    (offer: { status: string }) => offer.status === "completed",
  );
  await call("outsider", "post", `/offers/${source.id}/review`, {
    rating: 5,
    text: "Forged review",
  }).expect(404);
  const review = await call("merchant", "post", `/offers/${source.id}/review`, {
    rating: 5,
    text: "Actual collaboration review",
  }).expect(201);
  const partner = (await call("creator", "get", `/partners/${creatorId}`)).body;
  assert.equal(
    (await call("outsider", "get", `/public/partners/${partner.slug}/reviews`))
      .body.count,
    0,
  );
  await call("staff", "put", `/platform/reviews/${review.body.id}/status`, {
    version: 0,
    status: "approved",
    reason: "Reviewed",
  }).expect(200);
  const publicRead = (
    await call("outsider", "get", `/public/partners/${partner.slug}/reviews`)
  ).body;
  assert.equal(publicRead.count, 1);
  assert.equal(publicRead.rating, 5);
  assert.ok(!("sourceId" in publicRead.items[0]));
  assert.ok(!("authorId" in publicRead.items[0]));
  await call("creator", "post", `/reviews/${review.body.id}/reply`, {
    version: 1,
    text: "Actual partner response",
  }).expect(201);
});
