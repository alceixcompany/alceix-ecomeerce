export type AdminProduct = {
  id: string; name: string; category: string; description: string; sku: string; barcode: string;
  priceCents: number; costCents: number; stock: number; variants: string[]; images: string[];
  status: "live" | "draft"; model: "own" | "supplier"; seoTitle: string; seoDescription: string; createdAt: string;
};
export type ProductDraft = Omit<AdminProduct, "id" | "createdAt" | "priceCents" | "costCents" | "stock" | "variants"> & { price: string; cost: string; stock: string; variants: string };
