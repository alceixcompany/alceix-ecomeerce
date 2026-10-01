import { createApp } from "../bootstrap";
import { loadConfig } from "../config/config";
import { DATABASE } from "./database";
import type { Connection } from "mongoose";
async function main() {
  const app = await createApp(loadConfig());
  try {
    const db = app.get<Connection>(DATABASE);
    for (const model of Object.values(db.models)) await model.createIndexes();
    console.log("Indexes created.");
  } finally {
    await app.close();
  }
}
void main().catch(() => {
  console.error(
    "Index creation failed. Check existing duplicates and connectivity.",
  );
  process.exitCode = 1;
});
