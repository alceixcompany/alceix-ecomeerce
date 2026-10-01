import { Injectable } from "@nestjs/common";
import sharp from "sharp";
import type { ImageProcessor, Media } from "../application/media.ports";
@Injectable()
export class SharpImages implements ImageProcessor {
  async normalize(content: Buffer, kind: Media["kind"]): Promise<Buffer> {
    const dimension = { product: 1600, banner: 1920, logo: 512, favicon: 64 }[
      kind
    ];
    const image = sharp(content, {
      limitInputPixels: 40_000_000,
      animated: false,
    });
    const metadata = await image.metadata();
    if (
      !["png", "jpeg", "webp"].includes(metadata.format ?? "") ||
      (metadata.pages ?? 1) > 1
    )
      throw new Error("Unsupported image");
    return image
      .rotate()
      .resize({
        width: dimension,
        height: dimension,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 80, effort: 4 })
      .toBuffer();
  }
}
