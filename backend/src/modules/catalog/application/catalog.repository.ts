import type { Product, Category } from "../domain/product";
import type { ListQuery } from "../domain/list-query";
export const CATALOG = Symbol("CATALOG");
export type ProductList = {
  items: Product[];
  total: number;
  page: number;
  pageCount: number;
  counts: { all: number; live: number; draft: number; critical: number };
  categories: string[];
};
export interface CatalogRepository {
  list(
    storeId: string,
    query: ListQuery,
    publicOnly: boolean,
  ): Promise<ProductList>;
  byId(storeId: string, id: string): Promise<Product | null>;
  claimSkus(
    storeId: string,
    productId: string,
    skus: string[],
  ): Promise<boolean>;
  create(product: Product): Promise<void>;
  update(product: Product, expectedVersion: number): Promise<Product | null>;
  adjustStock(
    storeId: string,
    id: string,
    amount: number,
    variant?: string,
    requestId?: string,
    actorId?: string,
  ): Promise<Product | null>;
  ensureCategory(storeId: string, name: string): Promise<Category>;
  categories(storeId: string): Promise<Category[]>;
  reserve(
    storeId: string,
    id: string,
    quantity: number,
    variant?: string,
  ): Promise<Product | null>;
  consume(
    storeId: string,
    id: string,
    quantity: number,
    variant?: string,
  ): Promise<Product | null>;
  restock(
    storeId: string,
    id: string,
    quantity: number,
    variant?: string,
  ): Promise<Product | null>;
  release(
    storeId: string,
    id: string,
    quantity: number,
    variant?: string,
  ): Promise<Product | null>;
}
