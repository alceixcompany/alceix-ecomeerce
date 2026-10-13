import type { Seller, Invoice } from "../domain/invoice";
export const INVOICES = Symbol("INVOICES");
export interface InvoicesRepository {
  seller(storeId: string): Promise<Seller | null>;
  saveSeller(seller: Seller, version: number): Promise<Seller | null>;
  find(id: string): Promise<Invoice | null>;
  order(orderId: string): Promise<Invoice | null>;
  credit(id: string): Promise<Invoice | null>;
  create(invoice: Invoice): Promise<void>;
  save(invoice: Invoice, version: number): Promise<Invoice | null>;
}
