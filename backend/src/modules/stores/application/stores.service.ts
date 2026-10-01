import { Inject, Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { STORES, type StoresRepository } from "./stores.repository";
import {
  settingsOf,
  type StoreSettings,
  type Store,
  reservedSlugs,
  slugify,
} from "../domain/store";
import { conflict, notFound } from "../../../shared/errors";
@Injectable()
export class StoresService {
  constructor(@Inject(STORES) private readonly repository: StoresRepository) {}
  async createOwned(ownerId: string, name: string) {
    const base = slugify(name),
      suffix = randomUUID().slice(0, 8);
    const slug = `${reservedSlugs.has(base) ? "magaza" : base}-${suffix}`;
    const store: Store = {
      id: randomUUID(),
      ownerId,
      name,
      slug,
      company: "",
      bio: "",
      instagram: "",
      tiktok: "",
      whatsapp: "",
      youtube: "",
      seoTitle: name,
      seoDescription: "",
      isOpen: false,
      mode: "normal",
      bannerImage: "",
      logoImage: "",
      faviconImage: "",
      version: 0,
      createdAt: new Date(),
    };
    await this.repository.create(store);
    return store;
  }
  ownedBy(userId: string) {
    return this.repository.ownedBy(userId);
  }
  async owned(slug: string, userId: string) {
    const store = await this.repository.findBySlug(slug);
    if (!store || store.ownerId !== userId) throw notFound();
    return store;
  }
  async publicBySlug(slug: string) {
    const store = await this.repository.findBySlug(slug);
    if (!store) throw notFound();
    return store;
  }
  async byId(id: string) {
    const store = await this.repository.findById(id);
    if (!store) throw notFound();
    return store;
  }
  async save(
    store: Store,
    settings: StoreSettings,
    version: number,
    draft: boolean,
  ) {
    if (reservedSlugs.has(settings.slug))
      throw conflict("Bu mağaza adresi platform için ayrılmıştır.");
    const saved = await this.repository.update(
      store.id,
      version,
      settings,
      draft,
    );
    if (!saved) throw conflict();
    return saved;
  }
  profile(store: Store) {
    return { ...settingsOf(store), id: store.id, version: store.version };
  }
}
