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
  variants: string[];
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
  "id" | "storeId" | "categoryId" | "version" | "createdAt"
>;
export type Category = {
  id: string;
  storeId: string;
  name: string;
  key: string;
};
export const normalize = (value: string) =>
  value.toLocaleLowerCase("tr-TR").trim();
