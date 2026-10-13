import type { WholesaleOrder, ImportReceipt } from "../domain/wholesale";
import type { PageQuery } from "../../../shared/page";
export const WHOLESALE = Symbol("WHOLESALE");
export interface WholesaleRepository {
  find(id: string): Promise<WholesaleOrder | null>;
  shipment(id: string): Promise<WholesaleOrder | null>;
  create(order: WholesaleOrder): Promise<void>;
  save(order: WholesaleOrder, version: number): Promise<WholesaleOrder | null>;
  list(
    scope: { storeId?: string; partnerId?: string },
    query: PageQuery,
  ): Promise<{
    items: WholesaleOrder[];
    total: number;
    page: number;
    pages: number;
  }>;
  ready(): Promise<WholesaleOrder[]>;
  importReceipt(id: string): Promise<ImportReceipt | null>;
  createImport(receipt: ImportReceipt): Promise<void>;
}
