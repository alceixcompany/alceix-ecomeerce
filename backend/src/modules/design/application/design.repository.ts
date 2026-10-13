import type { DesignRecord, StoreDesign } from "../domain/design";
export const DESIGN = Symbol("DESIGN");
export interface DesignRepository {
  get(storeId: string): Promise<DesignRecord | null>;
  save(
    storeId: string,
    version: number,
    design: StoreDesign,
    publish: boolean,
  ): Promise<DesignRecord | null>;
}
