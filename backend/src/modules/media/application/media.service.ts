import { Inject, Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import {
  IMAGES,
  type ImageProcessor,
  FILES,
  MEDIA_RECORDS,
  type FileStorage,
  type MediaRepository,
  type Media,
} from "./media.ports";
import { AppError, notFound } from "../../../shared/errors";
const prefix = "/api/v1/media/";
export const sampleImages = new Set(
  ["cardigan", "serum", "phone-stand", "cardholder"].flatMap((name) => [
    `/dropshipping/${name}.jpg`,
    `/storefront/gallery/${name}-alternate.png`,
  ]),
);
@Injectable()
export class MediaService {
  constructor(
    @Inject(IMAGES) private readonly images: ImageProcessor,
    @Inject(FILES) private readonly files: FileStorage,
    @Inject(MEDIA_RECORDS) private readonly records: MediaRepository,
  ) {}
  async upload(
    storeId: string,
    kind: Media["kind"],
    file?: { buffer: Buffer; size: number },
  ) {
    if (!file || file.size > (kind === "product" ? 15 : 4) * 1024 * 1024)
      throw new AppError(
        422,
        "INVALID_FILE",
        "Dosya eksik veya boyut sınırını aşıyor.",
      );
    let buffer: Buffer;
    try {
      buffer = await this.images.normalize(file.buffer, kind);
    } catch {
      throw new AppError(
        422,
        "INVALID_FILE",
        "Geçerli bir PNG, JPG veya WebP görseli seçin.",
      );
    }
    const id = randomUUID();
    await this.files.write(id, buffer);
    try {
      await this.records.create({
        id,
        storeId,
        kind,
        createdAt: new Date(),
        size: buffer.length,
      });
    } catch (error) {
      await this.files.remove(id);
      throw error;
    }
    return { id, url: `${prefix}${id}`, size: buffer.length };
  }
  async assertOwned(storeId: string, urls: string[], kind: Media["kind"]) {
    for (const url of urls.filter(Boolean)) {
      if (kind === "product" && sampleImages.has(url)) continue;
      if (!url.startsWith(prefix))
        throw new AppError(
          422,
          "INVALID_MEDIA",
          "Görseli önce mağazanıza yükleyin.",
        );
      const media = await this.records.byId(url.slice(prefix.length));
      if (!media || media.storeId !== storeId || media.kind !== kind)
        throw new AppError(
          422,
          "INVALID_MEDIA",
          "Görsel bu mağazaya veya alana ait değil.",
        );
    }
  }
  async read(id: string) {
    if (!(await this.records.byId(id))) throw notFound();
    try {
      return await this.files.read(id);
    } catch {
      throw notFound();
    }
  }
}
