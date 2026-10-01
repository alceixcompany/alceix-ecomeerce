import { Inject, Injectable } from "@nestjs/common";
import { mkdir, writeFile, readFile, unlink } from "node:fs/promises";
import { join } from "node:path";
import { CONFIG, type AppConfig } from "../../../config/config";
import type { FileStorage } from "../application/media.ports";
@Injectable()
export class LocalFiles implements FileStorage {
  constructor(@Inject(CONFIG) private readonly config: AppConfig) {}
  private path(id: string) {
    if (!/^[a-f0-9-]{36}$/.test(id)) throw new Error("Invalid storage key");
    return join(this.config.mediaDirectory, `${id}.webp`);
  }
  async write(id: string, buffer: Buffer) {
    await mkdir(this.config.mediaDirectory, { recursive: true });
    await writeFile(this.path(id), buffer, { flag: "wx" });
  }
  read(id: string) {
    return readFile(this.path(id));
  }
  async remove(id: string) {
    await unlink(this.path(id)).catch(() => undefined);
  }
}
