import { createApp } from "./bootstrap";
import { loadConfig } from "./config/config";
async function main() {
  const config = loadConfig();
  const app = await createApp(config);
  app.enableShutdownHooks();
  await app.listen(config.port, "127.0.0.1");
}
void main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Startup failed");
  process.exitCode = 1;
});
