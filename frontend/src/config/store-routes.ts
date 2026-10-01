export const storeRoutes = {
  storefront: (slug: string) => `/${encodeURIComponent(slug)}`,
  admin: (slug: string) => `/${encodeURIComponent(slug)}/admin`,
  products: (slug: string) => `/${encodeURIComponent(slug)}/admin/urunler`,
  settings: (slug: string) => `/${encodeURIComponent(slug)}/admin/ayarlar`,
  dashboard: (slug: string) => `/${encodeURIComponent(slug)}/admin/dashboard`,
};
