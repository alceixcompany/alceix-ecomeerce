import { storeCapabilities } from "../domain/membership";
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
import { TeamService } from "./team.service";
import type { StoreCapability } from "../domain/membership";
@Injectable()
export class StoresService {
  constructor(
    @Inject(STORES) private readonly repository: StoresRepository,
    private readonly team: TeamService,
  ) {}
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
  adminList(q: string, page: number, limit: number) {
    return this.repository.adminList(q, page, limit);
  }
  async accessibleBy(userId: string) {
    const owned = await this.repository.ownedBy(userId),
      ids = await this.team.storeIds(userId);
    const additional = await Promise.all(
      ids
        .filter((id) => !owned.some((store) => store.id === id))
        .map((id) => this.repository.findById(id)),
    );
    return [
      ...owned,
      ...additional.filter((store): store is Store => store !== null),
    ];
  }
  ownedBy(userId: string) {
    return this.repository.ownedBy(userId);
  }
  async owned(
    slug: string,
    userId: string,
    permission: StoreCapability = "owner",
  ) {
    const store = await this.repository.findBySlug(slug);
    if (
      !store ||
      store.platformSuspended ||
      (store.ownerId !== userId &&
        !(await this.team.can(store.id, userId, permission)))
    )
      throw notFound();
    return store;
  }
  async bySlug(slug: string) {
    const store = await this.repository.findBySlug(slug);
    if (!store) throw notFound();
    return store;
  }
  async publicBySlug(slug: string) {
    const store = await this.repository.findBySlug(slug);
    if (!store || store.platformSuspended) throw notFound();
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
  suspendOwner(ownerId: string, suspended: boolean) {
    return this.repository.suspendOwner(ownerId, suspended);
  }
  async capabilities(slug: string, userId: string) {
    const store = await this.owned(slug, userId, "read");
    return {
      storeId: store.id,
      owner: store.ownerId === userId,
      permissions:
        store.ownerId === userId
          ? storeCapabilities
          : await this.team.capabilities(store.id, userId),
    };
  }
}
