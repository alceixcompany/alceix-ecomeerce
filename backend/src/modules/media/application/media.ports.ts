export type Media = {
  id: string;
  storeId: string;
  kind: "product" | "banner" | "logo" | "favicon";
  createdAt: Date;
  size: number;
};
export const MEDIA_RECORDS = Symbol("MEDIA_RECORDS"),
  FILES = Symbol("FILES");
export interface MediaRepository {
  create(media: Media): Promise<void>;
  byId(id: string): Promise<Media | null>;
}
export interface FileStorage {
  write(id: string, content: Buffer): Promise<void>;
  read(id: string): Promise<Buffer>;
  remove(id: string): Promise<void>;
}

export const IMAGES = Symbol("IMAGES");
export interface ImageProcessor {
  // Reject non-raster/animated or excessive images and return normalized, metadata-free WebP.
  normalize(content: Buffer, kind: Media["kind"]): Promise<Buffer>;
}
