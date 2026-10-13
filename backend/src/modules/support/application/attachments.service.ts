import { Inject, Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import {
  IMAGES,
  type ImageProcessor,
} from "../../media/application/media.ports";
import {
  SUPPORT_FILES,
  SUPPORT_FILE_STORAGE,
  type SupportFileRepository,
  type SupportFileStorage,
  type SupportFile,
} from "./attachments.ports";
import { AppError, notFound } from "../../../shared/errors";
@Injectable()
export class AttachmentsService {
  constructor(
    @Inject(SUPPORT_FILES) private readonly files: SupportFileRepository,
    @Inject(SUPPORT_FILE_STORAGE) private readonly storage: SupportFileStorage,
    @Inject(IMAGES) private readonly images: ImageProcessor,
  ) {}
  async upload(
    storeId: string,
    file?: {
      buffer: Buffer;
      size: number;
      originalname: string;
      mimetype: string;
    },
    uploadedBy?: string,
  ) {
    if (!file || !file.size || file.size > 2 * 1024 * 1024)
      throw new AppError(
        422,
        "INVALID_FILE",
        "Ek dosyası boş veya 2 MB sınırını aşıyor.",
      );
    let buffer = file.buffer;
    let mime: SupportFile["mime"];
    try {
      if (["image/png", "image/jpeg", "image/webp"].includes(file.mimetype)) {
        buffer = await this.images.normalize(buffer, "product");
        mime = "image/webp";
      } else if (
        file.mimetype === "application/pdf" &&
        /^%PDF-(?:1\.[0-7]|2\.0)[\r\n ]/.test(
          buffer.subarray(0, 12).toString(),
        ) &&
        /%%EOF\s*$/.test(
          buffer.subarray(Math.max(0, buffer.length - 1024)).toString(),
        )
      ) {
        mime = "application/pdf";
      } else if (file.mimetype === "text/plain") {
        const text = new TextDecoder("utf-8", { fatal: true }).decode(buffer);
        if (text.includes("\0") || /<(?:script|html|svg)\b/i.test(text))
          throw new Error("Invalid text");
        mime = "text/plain";
      } else throw new Error("Unsupported file");
    } catch {
      throw new AppError(
        422,
        "INVALID_FILE",
        "Geçerli PNG, JPG, WebP, PDF veya UTF-8 TXT seçin.",
      );
    }
    const stem =
      file.originalname
        .replace(/[^\p{L}\p{N} ._-]/gu, "_")
        .replace(/\.[^.]*$/, "")
        .slice(0, 110) || "ek";
    const name =
      stem +
      {
        "image/webp": ".webp",
        "application/pdf": ".pdf",
        "text/plain": ".txt",
      }[mime];
    const saved: SupportFile = {
      id: randomUUID(),
      storeId,
      uploadedBy,
      name,
      mime,
      size: buffer.length,
      lifecycle: "unclaimed",
      createdAt: new Date(),
    };
    await this.storage.write(saved.id, buffer);
    try {
      await this.files.create(saved);
    } catch (error) {
      await this.storage.remove(saved.id);
      throw error;
    }
    return this.view(saved);
  }
  view(file: SupportFile) {
    return { id: file.id, name: file.name, mime: file.mime, size: file.size };
  }
  async resolve(storeId: string, ids: string[], uploadedBy?: string) {
    const result = [];
    for (const id of ids) {
      const file = await this.files.find(storeId, id);
      if (!file || (uploadedBy && file.uploadedBy !== uploadedBy))
        throw notFound();
      if (!(await this.files.retain(id))) throw notFound();
      result.push(this.view(file));
    }
    return result;
  }
  async cleanup(cutoff: Date) {
    let removed = 0;
    for (let index = 0; index < 20; index++) {
      const file = await this.files.garbage(cutoff);
      if (!file) break;
      await this.storage.remove(file.id);
      await this.files.removeRecord(file.id);
      removed++;
    }
    return { removed };
  }
  async read(storeId: string, id: string) {
    const file = await this.files.find(storeId, id);
    if (!file) throw notFound();
    try {
      return { file, buffer: await this.storage.read(id) };
    } catch {
      throw notFound();
    }
  }
}
