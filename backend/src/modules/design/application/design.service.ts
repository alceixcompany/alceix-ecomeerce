import { Inject, Injectable } from "@nestjs/common";
import { DESIGN, type DesignRepository } from "./design.repository";
import type { StoreDesign } from "../domain/design";
import { MediaService } from "../../media/application/media.service";
import { AppError, conflict } from "../../../shared/errors";
@Injectable()
export class DesignService {
  constructor(
    @Inject(DESIGN) private readonly repository: DesignRepository,
    private readonly media: MediaService,
  ) {}
  async get(storeId: string) {
    const record = await this.repository.get(storeId);
    return {
      version: record?.version ?? 0,
      draft: record?.draft ?? null,
      published: record?.published ?? null,
      updatedAt: record?.updatedAt ?? null,
      publishedAt: record?.publishedAt ?? null,
    };
  }
  async published(storeId: string) {
    const record = await this.repository.get(storeId);
    return {
      design: record?.published ?? null,
      publishedAt: record?.publishedAt ?? null,
    };
  }
  async save(
    storeId: string,
    version: number,
    design: StoreDesign,
    publish: boolean,
  ) {
    if (design.hero.image !== "/dropshipping/supplier-knit.jpg")
      await this.media.assertOwned(storeId, [design.hero.image], "banner");
    if (publish) {
      const visible = design.sections.filter((section) => section.visible);
      if (
        !visible.length ||
        visible.some((section) => !section.title) ||
        (design.announcement.enabled && !design.announcement.text) ||
        (visible.some((section) => section.kind === "hero") &&
          (!design.hero.title || !design.hero.buttonLabel))
      )
        throw new AppError(
          422,
          "INCOMPLETE_DESIGN",
          "Yayın için görünür bölüm ve gerekli başlıkları doldurun.",
        );
      if (!visible.some((section) => section.kind === "products"))
        throw new AppError(
          422,
          "INCOMPLETE_DESIGN",
          "Yayında ürün bölümü görünür olmalı.",
        );
      for (const section of visible.filter(
        (section) => section.kind === "video",
      )) {
        try {
          const url = new URL(section.videoUrl),
            id =
              url.hostname === "youtu.be"
                ? url.pathname.slice(1)
                : ["youtube.com", "www.youtube.com"].includes(url.hostname) &&
                    url.pathname === "/watch"
                  ? url.searchParams.get("v")
                  : null;
          if (url.protocol !== "https:" || !id || !/^[\w-]{11}$/.test(id))
            throw new Error();
        } catch {
          throw new AppError(
            422,
            "INVALID_VIDEO",
            "Geçerli bir HTTPS YouTube video bağlantısı ekleyin.",
          );
        }
      }
    }
    const record = await this.repository.save(
      storeId,
      version,
      design,
      publish,
    );
    if (!record) throw conflict();
    return {
      version: record.version,
      draft: record.draft,
      published: record.published ?? null,
      updatedAt: record.updatedAt,
      publishedAt: record.publishedAt ?? null,
    };
  }
}
