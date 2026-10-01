export type StoreProduct = {
  id: string; priceCents?: number; stock?: number;
  name: string;
  category: string;
  image: string;
  images: { src: string; alt: string }[];
  price: number;
  description: string;
  badge?: string;
};
export type Store = {
  id?: string; real?: boolean; canPurchase?: boolean; bannerImage?: string; logoImage?: string; faviconImage?: string; seoTitle?: string; seoDescription?: string; catalogTotal?: number; categories?: string[]; categoryCounts?: Record<string,number>;
  catalogPage?: number; catalogPageCount?: number; catalogQuery?: string; catalogAll?: number;
  slug: string;
  name: string;
  initials: string;
  tagline: string;
  description: string;
  about: string;
  socials: { platform: string; icon: string; url?: string }[];
  products: StoreProduct[];
};

const demoStore: Store = {
  slug: "luma-studio",
  name: "Luma Studio",
  initials: "LS",
  tagline: "Günlük hayatın küçük güzellikleri.",
  description: "Gardırobunuza, evinize ve kendinize iyi gelen parçalar. Özenle seçilmiş, sadeliği seven bir koleksiyon.",
  about: "Luma Studio, gündelik hayatın sade ve kullanışlı parçalarını bir araya getiren örnek bir mağazadır. Giyim, bakım ve ev yaşamı seçkilerini aynı vitrinde sunar. Bu demo; bir mağazanın hikâyesini, ürünlerini ve sosyal medya bağlantılarını müşterilerine nasıl gösterebileceğini örnekler.",
  socials: [{ platform: "Instagram", icon: "photo_camera" }, { platform: "TikTok", icon: "music_note" }, { platform: "Pinterest", icon: "push_pin" }],
  products: [
    { id: "soft-cardigan", name: "Soft Oversize Triko Hırka", category: "Giyim", image: "/dropshipping/cardigan.jpg", images: [{ src: "/dropshipping/cardigan.jpg", alt: "Ürün genel görünümü" }, { src: "/storefront/gallery/cardigan-alternate.png", alt: "Ürünün farklı açıdan demo görünümü" }], price: 690, badge: "Öne çıkan", description: "Rahat kesimi ve sade görünümüyle günlük kombinlerinize eşlik eden triko hırka." },
    { id: "vitamin-serum", name: "C Vitamini Bakım Serumu · 30 ml", category: "Bakım", image: "/dropshipping/serum.jpg", images: [{ src: "/dropshipping/serum.jpg", alt: "Ürün genel görünümü" }, { src: "/storefront/gallery/serum-alternate.png", alt: "Ürünün farklı açıdan demo görünümü" }], price: 340, badge: "Bakım seçkisi", description: "Günlük bakım rutininiz için seçtiğimiz 30 ml serum. Kullanımdan önce ürün üzerindeki talimatları inceleyin." },
    { id: "oak-stand", name: "Meşe Masa Üstü Telefon Standı", category: "Ev & Yaşam", image: "/dropshipping/phone-stand.jpg", images: [{ src: "/dropshipping/phone-stand.jpg", alt: "Ürün genel görünümü" }, { src: "/storefront/gallery/phone-stand-alternate.png", alt: "Ürünün farklı açıdan demo görünümü" }], price: 380, description: "Çalışma masanızda telefonunuza yer açan, doğal görünümlü ahşap stand." },
    { id: "leather-cardholder", name: "Minimal Deri Kartlık", category: "Aksesuar", image: "/dropshipping/cardholder.jpg", images: [{ src: "/dropshipping/cardholder.jpg", alt: "Ürün genel görünümü" }, { src: "/storefront/gallery/cardholder-alternate.png", alt: "Ürünün farklı açıdan demo görünümü" }], price: 490, badge: "Zamansız", description: "Kartlarınızı bir arada tutan, sade ve kompakt tasarımlı deri kartlık." },
  ],
};

// Demo registry. Replace with a tenant lookup when the store API is available.
// Unknown slugs deliberately do not receive another store's products.
export function getStore(slug: string): Store | undefined {
  return slug === demoStore.slug || slug === "magazaadi" ? demoStore : undefined;
}
