import { test } from "node:test";
import assert from "node:assert/strict";
import { slugify, reservedSlugs } from "../src/modules/stores/domain/store";
import { ScryptPasswords } from "../src/modules/auth/infrastructure/scrypt-passwords";
import { loadConfig } from "../src/config/config";
import { listSchema, parse } from "../src/shared/validation";

test("Turkish store names produce safe slugs; public routes are reserved", () => {
  assert.equal(slugify("İpek & Işık Atölyesi!"), "ipek-isik-atolyesi");
  assert.equal(slugify("***"), "magaza");
  assert(reservedSlugs.has("giris-yap"));
  assert(reservedSlugs.has("api"));
  assert.match(slugify("a".repeat(50)), /^[a-z0-9-]{1,45}$/);
});
test("password hashes use unique salts and reject wrong passwords", async () => {
  const passwords = new ScryptPasswords();
  const first = await passwords.hash("test-password");
  const second = await passwords.hash("test-password");
  assert.notEqual(first, second);
  assert(!first.includes("test-password"));
  assert(await passwords.verify("test-password", first));
  assert(!(await passwords.verify("wrong-password", first)));
  assert(!(await passwords.verify("test-password", "invalid")));
});
test("unsafe config and invalid pagination fail before use", () => {
  assert.throws(() => loadConfig({ MONGODB_URI: "not-mongo" }));
  assert.throws(() =>
    loadConfig({
      MONGODB_URI: "mongodb://localhost/test",
      NODE_ENV: "production",
      FRONTEND_ORIGIN: "http://example.com",
    }),
  );
  assert.throws(() => parse(listSchema, { page: "-1" }));
  assert.throws(() => parse(listSchema, { limit: "100000" }));
  assert.throws(() => parse(listSchema, { $where: "evil" }));
});

test("catalogue rejects invalid price ranges and accepts bounded stock filters", () => {
  assert.throws(() => parse(listSchema, { min: "2000", max: "1000" }));
  assert.throws(() => parse(listSchema, { min: "10000000000" }));
  assert.throws(() => parse(listSchema, { availability: "anything" }));
  const query = parse(listSchema, {
    availability: "in-stock",
    model: "supplier",
  });
  assert.equal(query.availability, "in-stock");
  assert.equal(query.model, "supplier");
  assert(reservedSlugs.has("tedarikci"));
  assert(reservedSlugs.has("influencer"));
});
