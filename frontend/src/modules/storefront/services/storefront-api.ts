import { z } from "zod";
import { api } from "@/lib/http";
export const publicStoreSchema = z.object({
  id: z.uuid(),
  slug: z.string(),
  name: z.string(),
  bio: z.string(),
  instagram: z.string(),
  tiktok: z.string(),
  whatsapp: z.string(),
  youtube: z.string(),
  seoTitle: z.string(),
  seoDescription: z.string(),
  bannerImage: z.string(),
  logoImage: z.string(),
  faviconImage: z.string(),
  isOpen: z.boolean(),
  mode: z.enum(["normal", "maintenance", "holiday"]),
  canPurchase: z.boolean(),
});
export const publicProductSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  category: z.string(),
  description: z.string(),
  priceCents: z.number().int(),
  currency: z.literal("TRY"),
  stock: z.number().int(),
  images: z.array(z.string()),
});
export const publicListSchema = z.object({
  items: z.array(publicProductSchema),
  total: z.number(),
  page: z.number(),
  pageCount: z.number(),
  categories: z.array(z.string()),
  categoryCounts: z.record(z.string(), z.number()).optional(),
  counts: z.object({
    all: z.number(),
    live: z.number(),
    draft: z.number(),
    critical: z.number(),
  }),
});
export const cartSchema = z.object({
  version: z.number(),
  lines: z.array(z.object({ productId: z.uuid(), quantity: z.number() })),
  items: z.array(
    z.object({
      productId: z.uuid(),
      quantity: z.number(),
      name: z.string(),
      image: z.string(),
      priceCents: z.number(),
      lineTotalCents: z.number(),
    }),
  ),
  totalCents: z.number(),
  currency: z.literal("TRY"),
  issues: z.array(z.string()),
  valid: z.boolean(),
  reservesStock: z.literal(false),
});
export type Cart = z.infer<typeof cartSchema>;
const base = (slug: string) => `/public/stores/${encodeURIComponent(slug)}`;
export function getCart(slug: string) {
  return api(`${base(slug)}/cart`, cartSchema);
}
export function saveCart(slug: string, lines: Cart["lines"], version: number) {
  return api(`${base(slug)}/cart`, cartSchema, {
    method: "PUT",
    body: JSON.stringify({ lines, version }),
  });
}
export function getFollow(slug: string) {
  return api(`${base(slug)}/follow`, z.object({ followed: z.boolean() }));
}
export function setFollow(slug: string, enabled: boolean) {
  return api(`${base(slug)}/follow`, z.object({ followed: z.boolean() }), {
    method: enabled ? "PUT" : "DELETE",
  });
}
export function listPublicProducts(
  slug: string,
  params: URLSearchParams,
  signal?: AbortSignal,
) {
  return api(`${base(slug)}/products?${params}`, publicListSchema, { signal });
}
export function toStoreProduct(
  product: z.infer<typeof publicProductSchema>,
): import("../data/stores").StoreProduct {
  return {
    id: product.id,
    name: product.name,
    category: product.category,
    description: product.description,
    price: product.priceCents / 100,
    priceCents: product.priceCents,
    stock: product.stock,
    image: product.images[0] || "/file.svg",
    images: product.images.map((src) => ({ src, alt: product.name })),
  };
}
