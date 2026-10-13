import { createApp } from "../src/bootstrap";
import type { AppConfig } from "../src/config/config";
export async function createTestApp(config: AppConfig) {
  const app = await createApp(config);
  await app.listen(0, "127.0.0.1");
  return app;
}
