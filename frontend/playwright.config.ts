import { defineConfig, devices } from "@playwright/test";
import { resolve } from "node:path";
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 90000,
  use: { baseURL: "http://localhost:3010", trace: "retain-on-failure" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command: "node -r ts-node/register test/browser-server.ts",
      cwd: resolve(__dirname, "../backend"),
      url: "http://127.0.0.1:4010/api/v1/health/ready",
      timeout: 60000,
      reuseExistingServer: false,
    },
    {
      command: "npm run build && npm run start -- --port 3010",
      env: { BACKEND_API_URL: "http://127.0.0.1:4010" },
      url: "http://localhost:3010/giris-yap",
      timeout: 120000,
      reuseExistingServer: false,
    },
  ],
});
