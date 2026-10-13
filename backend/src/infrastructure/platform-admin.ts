import { createApp } from "../bootstrap";
import { loadConfig } from "../config/config";
import { UsersService } from "../modules/users/application/users.service";
async function main() {
  const [operation, email, ...extra] = process.argv.slice(2);
  if (
    !["grant", "revoke"].includes(operation ?? "") ||
    !email ||
    extra.length
  ) {
    console.error(
      "Usage: npm run admin:role -- grant|revoke existing-user@example.com",
    );
    process.exitCode = 1;
    return;
  }
  const app = await createApp(
    loadConfig({ ...process.env, WORKERS_ENABLED: "false" }),
  );
  try {
    const users = app.get(UsersService),
      user = await users.findByEmail(email.trim().toLowerCase());
    if (!user) {
      console.error("Existing account required. No account was created.");
      process.exitCode = 1;
      return;
    }
    await users.setPlatformAdmin(user.id, operation === "grant");
    console.log("Platform role updated for the selected existing account.");
  } finally {
    await app.close();
  }
}
void main().catch(() => {
  console.error(
    "Role change failed. Check server configuration and connectivity.",
  );
  process.exitCode = 1;
});
