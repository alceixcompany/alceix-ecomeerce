import { Inject, Injectable } from "@nestjs/common";
import { mkdir, readFile, writeFile, unlink } from "node:fs/promises";
import { join } from "node:path";
import { CONFIG, type AppConfig } from "../../../config/config";
import type { SupportFileStorage } from "../application/attachments.ports";
@Injectable()
export class LocalSupportFiles implements SupportFileStorage {
  private readonly directory: string;
  constructor(@Inject(CONFIG) config: AppConfig) {
    this.directory = join(config.mediaDirectory, "support");
  }
  async write(id: string, buffer: Buffer) {
    await mkdir(this.directory, { recursive: true });
    await writeFile(join(this.directory, `${id}.bin`), buffer, {
      flag: "wx",
      mode: 0o600,
    });
  }
  read(id: string) {
    return readFile(join(this.directory, `${id}.bin`));
  }
  async remove(id: string) {
    await unlink(join(this.directory, `${id}.bin`)).catch((error) => {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    });
  }
}
