export type SupportFile = {
  id: string;
  storeId: string;
  uploadedBy?: string;
  name: string;
  mime: "image/webp" | "application/pdf" | "text/plain";
  size: number;
  lifecycle?: "unclaimed" | "retained" | "deleting";
  createdAt: Date;
};
export const SUPPORT_FILES = Symbol("SUPPORT_FILES"),
  SUPPORT_FILE_STORAGE = Symbol("SUPPORT_FILE_STORAGE");
export interface SupportFileRepository {
  retain(id: string): Promise<boolean>;
  garbage(cutoff: Date): Promise<SupportFile | null>;
  removeRecord(id: string): Promise<void>;
  create(file: SupportFile): Promise<void>;
  find(storeId: string, id: string): Promise<SupportFile | null>;
}
export interface SupportFileStorage {
  write(id: string, buffer: Buffer): Promise<void>;
  read(id: string): Promise<Buffer>;
  remove(id: string): Promise<void>;
}
