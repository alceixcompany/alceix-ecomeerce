export type ProductOption = {
  id: string;
  name: string;
  sku: string;
  priceCents: number;
  stock: number;
  reservedStock: number;
};
export type Product = {
  id: string;
  storeId: string;
  name: string;
  category: string;
  categoryId: string;
  description: string;
  sku: string;
  barcode: string;
  priceCents: number;
  costCents: number;
  currency: "TRY";
  stock: number;
  reservedStock?: number;
  variants: string[];
  options?: ProductOption[];
  images: string[];
  status: "live" | "draft";
  model: "own" | "supplier";
  seoTitle: string;
  seoDescription: string;
  version: number;
  createdAt: Date;
};
export type ProductInput = Omit<
  Product,
  | "id"
  | "storeId"
  | "categoryId"
  | "version"
  | "createdAt"
  | "reservedStock"
  | "options"
> & { options?: Omit<ProductOption, "reservedStock">[] };
export type Category = {
  id: string;
  storeId: string;
  name: string;
  key: string;
};
export const normalize = (value: string) =>
  value.toLocaleLowerCase("tr-TR").trim();
