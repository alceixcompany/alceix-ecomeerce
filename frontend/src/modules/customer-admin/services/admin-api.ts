import { z } from "zod";
import { api } from "@/lib/http";
import {
  settingsSchema,
  dashboardSchema,
  type StoreSettings,
} from "../types/store";
export const productSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  category: z.string(),
  description: z.string(),
  sku: z.string(),
  barcode: z.string(),
  priceCents: z.number().int().nonnegative(),
  costCents: z.number().int().nonnegative(),
  currency: z.literal("TRY"),
  stock: z.number().int().nonnegative(),
  variants: z.array(z.string()),
  images: z.array(z.string()),
  status: z.enum(["live", "draft"]),
  model: z.enum(["own", "supplier"]),
  seoTitle: z.string(),
  seoDescription: z.string(),
  createdAt: z.string(),
  version: z.number().int(),
});
export const productListSchema = z.object({
  items: z.array(productSchema),
  total: z.number(),
  page: z.number(),
  pageCount: z.number(),
  categories: z.array(z.string()),
  counts: z.object({
    all: z.number(),
    live: z.number(),
    draft: z.number(),
    critical: z.number(),
  }),
});
export type ProductList = z.infer<typeof productListSchema>;
const base = (slug: string) => `/stores/${encodeURIComponent(slug)}`;
export function listProducts(
  slug: string,
  params: URLSearchParams,
  signal?: AbortSignal,
) {
  return api(`${base(slug)}/products?${params}`, productListSchema, { signal });
}
export function productPayload(
  product: import("../types/product").AdminProduct,
) {
  const {
    name,
    category,
    description,
    sku,
    barcode,
    priceCents,
    costCents,
    stock,
    variants,
    images,
    status,
    model,
    seoTitle,
    seoDescription,
  } = product;
  return {
    name,
    category,
    description,
    sku,
    barcode,
    priceCents,
    costCents,
    stock,
    variants,
    images,
    status,
    model,
    seoTitle,
    seoDescription,
    currency: "TRY",
  };
}
export function saveProduct(
  slug: string,
  product: import("../types/product").AdminProduct,
  existing: boolean,
) {
  return api(
    `${base(slug)}/products${existing ? `/${product.id}` : ""}`,
    productSchema,
    {
      method: existing ? "PUT" : "POST",
      body: JSON.stringify({
        ...productPayload(product),
        ...(existing ? { version: product.version } : {}),
      }),
    },
  );
}
export function duplicateProduct(slug: string, id: string) {
  return api(`${base(slug)}/products/${id}/duplicate`, productSchema, {
    method: "POST",
  });
}
export function adjustStock(slug: string, id: string, amount: number) {
  return api(`${base(slug)}/products/${id}/stock`, productSchema, {
    method: "POST",
    body: JSON.stringify({ amount }),
  });
}
export function saveSettings(
  slug: string,
  settings: StoreSettings,
  version: number,
  draft: boolean,
) {
  return api(`${base(slug)}/settings${draft ? "/draft" : ""}`, settingsSchema, {
    method: "PUT",
    body: JSON.stringify({ ...settings, version }),
  });
}
export function loadSettingsDraft(slug: string) {
  return api(
    `${base(slug)}/settings/draft`,
    z.object({
      settings: settingsSchema.omit({ id: true, version: true }).nullable(),
      version: z.number(),
    }),
  );
}
export function uploadMedia(
  slug: string,
  file: File,
  kind: "product" | "banner" | "logo" | "favicon",
) {
  const body = new FormData();
  body.set("file", file);
  return api(
    `${base(slug)}/media?kind=${kind}`,
    z.object({ id: z.uuid(), url: z.string(), size: z.number() }),
    { method: "POST", body },
  );
}
export function addCategory(slug: string, name: string) {
  return api(
    `${base(slug)}/categories`,
    z.object({ id: z.uuid(), name: z.string() }),
    { method: "POST", body: JSON.stringify({ name }) },
  );
}
export function getDashboard(slug: string) {
  return api(`${base(slug)}/dashboard`, dashboardSchema);
}
