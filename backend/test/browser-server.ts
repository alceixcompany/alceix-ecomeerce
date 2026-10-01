import { createApp } from "../src/bootstrap";
import { loadConfig } from "../src/config/config";
import { mongoFixture } from "./mongo-fixture";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
async function main() {
  const fixture = await mongoFixture(),
    directory = await mkdtemp(join(tmpdir(), "alceix-e2e-media-"));
  const app = await createApp(
    loadConfig({
      NODE_ENV: "test",
      PORT: "4010",
      MONGODB_URI: fixture.uri,
      FRONTEND_ORIGIN: "http://localhost:3010",
      MEDIA_DIRECTORY: directory,
    }),
  );
  await app.listen(4010, "127.0.0.1");
  let closing = false;
  const close = async () => {
    if (closing) return;
    closing = true;
    await app.close();
    await fixture.cleanup();
    await rm(directory, { recursive: true, force: true });
    process.exit(0);
  };
  process.on("SIGTERM", () => {
    void close();
  });
  process.on("SIGINT", () => {
    void close();
  });
}
void main().catch((error) => {
  console.error(error instanceof Error ? error.message : "E2E startup failed");
  process.exitCode = 1;
});
