import { resolve } from "node:path";
import { createApp } from "../bootstrap";
import { loadConfig } from "../config/config";
import { assertDemoDatabase, seedDemo } from "./demo-seed";

async function main() {
  const config = loadConfig();
  assertDemoDatabase(config);
  const app = await createApp(config);
  try {
    console.log(
      JSON.stringify(
        await seedDemo(
          app,
          config,
          resolve(process.cwd(), "../frontend/public"),
        ),
        null,
        2,
      ),
    );
  } finally {
    await app.close();
  }
}
void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Demo seed failed.");
  process.exitCode = 1;
});
