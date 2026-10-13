import type { Partner, SupplyProduct } from "../domain/partner";
import type { PageQuery } from "../../../shared/page";
export const PARTNERS = Symbol("PARTNERS");
export interface PartnersRepository {
  suspendOwner(ownerId: string, suspended: boolean): Promise<void>;
  find(id: string): Promise<Partner | null>;
  bySlug(slug: string): Promise<Partner | null>;
  byApplication(id: string): Promise<Partner | null>;
  owned(userId: string): Promise<Partner[]>;
  create(partner: Partner): Promise<void>;
  save(partner: Partner, version: number): Promise<Partner | null>;
  list(
    kind: Partner["kind"],
    query: PageQuery,
    publicOnly?: boolean,
  ): Promise<{ items: Partner[]; total: number; page: number; pages: number }>;
  products(
    partnerId: string,
    query: PageQuery,
    publicOnly: boolean,
  ): Promise<{
    items: SupplyProduct[];
    total: number;
    page: number;
    pages: number;
  }>;
  product(partnerId: string, id: string): Promise<SupplyProduct | null>;
  createProduct(product: SupplyProduct): Promise<void>;
  saveProduct(
    product: SupplyProduct,
    version: number,
  ): Promise<SupplyProduct | null>;
  reserve(
    partnerId: string,
    id: string,
    quantity: number,
  ): Promise<SupplyProduct | null>;
  release(
    partnerId: string,
    id: string,
    quantity: number,
  ): Promise<SupplyProduct | null>;
  consume(
    partnerId: string,
    id: string,
    quantity: number,
  ): Promise<SupplyProduct | null>;
}
