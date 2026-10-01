import type { Store, StoreSettings } from "../domain/store";
export const STORES = Symbol("STORES");
export interface StoresRepository {
  create(store: Store): Promise<void>;
  findBySlug(slug: string): Promise<Store | null>;
  findById(id: string): Promise<Store | null>;
  ownedBy(ownerId: string): Promise<Store[]>;
  update(
    id: string,
    version: number,
    settings: StoreSettings,
    draft: boolean,
  ): Promise<Store | null>;
}
