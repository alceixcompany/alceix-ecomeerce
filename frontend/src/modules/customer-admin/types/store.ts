import { z } from "zod";
export const settingsSchema = z.object({
  id: z.uuid(),
  version: z.number().int(),
  name: z.string(),
  company: z.string(),
  slug: z.string(),
  bio: z.string(),
  instagram: z.string(),
  tiktok: z.string(),
  whatsapp: z.string(),
  youtube: z.string(),
  seoTitle: z.string(),
  seoDescription: z.string(),
  isOpen: z.boolean(),
  mode: z.enum(["normal", "maintenance", "holiday"]),
  bannerImage: z.string(),
  logoImage: z.string(),
  faviconImage: z.string(),
});
export type StoreSettings = Omit<
  z.infer<typeof settingsSchema>,
  "id" | "version"
>;
export type AdminStore = z.infer<typeof settingsSchema> & {
  initials: string;
  storefrontSlug: string;
  account: { name: string; email: string };
};
export const dashboardSchema = z.object({
  inventory: z.object({
    all: z.number(),
    live: z.number(),
    draft: z.number(),
    critical: z.number(),
    categories: z.number(),
  }),
  setup: z.object({
    profile: z.boolean(),
    products: z.boolean(),
    salesOpen: z.boolean(),
  }),
  unavailable: z.array(z.string()),
  sales: z.null(),
  orders: z.null(),
  finance: z.null(),
  customers: z.null(),
});
export type DashboardSummary = z.infer<typeof dashboardSchema>;
