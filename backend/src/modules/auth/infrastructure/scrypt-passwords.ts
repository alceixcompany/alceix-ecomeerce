import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import type { PasswordHasher } from "../application/auth.repository";
const derive = (password: string, salt: string) =>
  new Promise<Buffer>((resolve, reject) =>
    scrypt(
      password,
      salt,
      64,
      { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 },
      (error, key) => (error ? reject(error) : resolve(key)),
    ),
  );
export class ScryptPasswords implements PasswordHasher {
  async hash(password: string) {
    const salt = randomBytes(16).toString("hex");
    return `scrypt-v1:${salt}:${(await derive(password, salt)).toString("hex")}`;
  }
  async verify(password: string, stored: string) {
    const [version, salt, hash] = stored.split(":");
    if (
      version !== "scrypt-v1" ||
      !/^[a-f0-9]{32}$/.test(salt ?? "") ||
      !/^[a-f0-9]{128}$/.test(hash ?? "")
    )
      return false;
    return timingSafeEqual(
      await derive(password, salt),
      Buffer.from(hash, "hex"),
    );
  }
}
