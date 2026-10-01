import { test } from "node:test";
import assert from "node:assert/strict";
import { loadConfig } from "../src/config/config";
import { assertDemoDatabase } from "../src/infrastructure/demo-seed";
import { seedDemo } from "../src/infrastructure/demo-seed";
import { mongoFixture } from "./mongo-fixture";
import { createApp } from "../src/bootstrap";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { StoresService } from "../src/modules/stores/application/stores.service";
import { CatalogService } from "../src/modules/catalog/application/catalog.service";
import { settingsOf } from "../src/modules/stores/domain/store";
import type { ListQuery } from "../src/modules/catalog/domain/list-query";

test("public demo credentials cannot be seeded into production, remote or non-demo databases", () => {
  for (const uri of [
    "mongodb://127.0.0.1:27017/alceix",
    "mongodb://db.example.com:27017/alceix_demo",
    "mongodb+srv://localhost/alceix_demo",
    "mongodb://127.0.0.1:27017/alceix_demo_live",
    "mongodb://localhost.evil.example:27017/alceix_demo",
  ]) {
    assert.throws(() => assertDemoDatabase(loadConfig({ MONGODB_URI: uri })));
  }
  assert.throws(() =>
    assertDemoDatabase(
      loadConfig({
        NODE_ENV: "production",
        FRONTEND_ORIGIN: "https://example.com",
        MONGODB_URI: "mongodb://127.0.0.1:27017/alceix_demo",
      }),
    ),
  );
  for (const host of ["127.0.0.1", "localhost"]) {
    assert.doesNotThrow(() =>
      assertDemoDatabase(
        loadConfig({
          MONGODB_URI: `mongodb://${host}:27017/alceix_demo?replicaSet=rs0`,
        }),
      ),
    );
  }
});

test("demo seed is idempotent across catalogue pages and preserves edited settings and stock", async () => {
  const fixture = await mongoFixture({ localOnly: true });
  const directory = await mkdtemp(join(tmpdir(), "alceix-seed-media-"));
  const uri = new URL(fixture.uri);
  uri.pathname = "/alceix_demo";
  const config = loadConfig({
    NODE_ENV: "test",
    MONGODB_URI: uri.toString(),
    MEDIA_DIRECTORY: directory,
  });
  const app = await createApp(config);
  try {
    const assets = resolve(process.cwd(), "../frontend/public");
    const first = await seedDemo(app, config, assets);
    assert.deepEqual(
      first.map((store) => store.added),
      [36, 8],
    );
    const stores = app.get(StoresService),
      catalog = app.get(CatalogService);
    const store = await stores.publicBySlug("luma-studio");
    await stores.save(
      store,
      { ...settingsOf(store), bio: "Demo owner edited this profile" },
      store.version,
      false,
    );
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
    const source = (await catalog.list(store.id, query)).items[0];
    await catalog.adjustStock(store.id, source.id, 3);
    // Push seed products onto a second page; the seed must still find every existing SKU.
    for (let index = 0; index < 70; index++) {
      await catalog.create(store.id, {
        ...source,
        sku: `OWNER-${index}`,
        name: `Owner product ${index}`,
        stock: 0,
        status: "draft",
      });
    }
    const second = await seedDemo(app, config, assets);
    assert.deepEqual(
      second.map((store) => store.added),
      [0, 0],
    );
    assert.equal(second[0].counts.all, 106);
    assert.equal(
      (await catalog.product(store.id, source.id)).stock,
      source.stock + 3,
    );
    assert.equal(
      (await stores.publicBySlug("luma-studio")).bio,
      "Demo owner edited this profile",
    );
    assert.equal((await catalog.list(store.id, query, true)).total, 32);
  } finally {
    await app.close();
    await fixture.cleanup();
    await rm(directory, { recursive: true, force: true });
  }
});
