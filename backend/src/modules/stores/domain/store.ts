export type StoreSettings = {
  name: string;
  company: string;
  slug: string;
  bio: string;
  instagram: string;
  tiktok: string;
  whatsapp: string;
  youtube: string;
  seoTitle: string;
  seoDescription: string;
  isOpen: boolean;
  mode: "normal" | "maintenance" | "holiday";
  bannerImage: string;
  logoImage: string;
  faviconImage: string;
};
export type Store = StoreSettings & {
  id: string;
  ownerId: string;
  platformSuspended?: boolean;
  version: number;
  createdAt: Date;
  draft?: StoreSettings;
};
export const reservedSlugs = new Set([
  "partner-ekip-daveti",
  "eposta-dogrula",
  "banka-dogrulama-sonucu",
  "hesabim",
  "iletisim-tercihleri",
  "odeme-sonucu",
  "ai-kredi-sonucu",
  "api",
  "tedarikci",
  "influencer",
  "admin",
  "giris-yap",
  "sifremi-unuttum",
  "kayit-ol",
  "hakkimizda",
  "blog",
  "iletisim",
  "sss",
  "alceix-avantajlari",
  "tedarikci-ol",
  "urun-vitrinleri",
  "yardim-destek",
  "e-ticarete-basla",
  "satis-modelleri",
  "neden-alceix",
  "magaza-ve-vitrin",
  "is-ortaklarimiz",
  "is-birlikleri",
  "dropshipping-tedarik",
  "influencer-ol",
  "platform-ozellikleri",
  "uploads",
  "sifre-sifirla",
  "ekip-daveti",
]);
export function slugify(name: string): string {
  return (
    name
      .toLocaleLowerCase("tr-TR")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/ı/g, "i")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 45)
      .replace(/-$/, "") || "magaza"
  );
}
export function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toLocaleUpperCase("tr-TR");
}
export function settingsOf(store: Store): StoreSettings {
  const {
    name,
    company,
    slug,
    bio,
    instagram,
    tiktok,
    whatsapp,
    youtube,
    seoTitle,
    seoDescription,
    isOpen,
    mode,
    bannerImage,
    logoImage,
    faviconImage,
  } = store;
  return {
    name,
    company,
    slug,
    bio,
    instagram,
    tiktok,
    whatsapp,
    youtube,
    seoTitle,
    seoDescription,
    isOpen,
    mode,
    bannerImage,
    logoImage,
    faviconImage,
  };
}
