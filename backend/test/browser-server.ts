import type { INestApplication } from "@nestjs/common";
import { UsersService } from "../src/modules/users/application/users.service";
import {
  PASSWORDS,
  type PasswordHasher,
} from "../src/modules/auth/application/auth.repository";
import { randomUUID } from "node:crypto";
import { createApp } from "../src/bootstrap";
import { loadConfig } from "../src/config/config";
import { mongoFixture } from "./mongo-fixture";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
async function main() {
  const fixture = await mongoFixture(),
    directory = await mkdtemp(join(tmpdir(), "alceix-e2e-media-"));
  let app: INestApplication | undefined,
    closing = false;
  const cleanup = async () => {
    if (closing) return;
    closing = true;
    try {
      await app?.close();
    } finally {
      try {
        await fixture.cleanup();
      } finally {
        await rm(directory, { recursive: true, force: true });
      }
    }
  };
  process.on("SIGTERM", () => {
    void cleanup().finally(() => process.exit(0));
  });
  process.on("SIGINT", () => {
    void cleanup().finally(() => process.exit(0));
  });
  try {
    app = await createApp(
      loadConfig({
        NODE_ENV: "test",
        PORT: "4010",
        MONGODB_URI: fixture.uri,
        FRONTEND_ORIGIN: "http://localhost:3010",
        MEDIA_DIRECTORY: directory,
      }),
    );
    // This account exists only in the isolated, disposable E2E database.
    await app.get(UsersService).create({
      id: randomUUID(),
      name: "E2E Platform Staff",
      email: "e2e-platform-staff@example.test",
      passwordHash: await app
        .get<PasswordHasher>(PASSWORDS)
        .hash("E2ePlatform2026!"),
      platformAdmin: true,
      createdAt: new Date(),
    });
    await app.listen(4010, "127.0.0.1");
  } catch (error) {
    await cleanup();
    throw error;
  }
}
void main().catch((error) => {
  console.error(error instanceof Error ? error.message : "E2E startup failed");
  process.exitCode = 1;
});
