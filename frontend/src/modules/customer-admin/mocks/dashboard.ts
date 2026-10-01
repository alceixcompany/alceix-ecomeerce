export type AdminStore = { name: string; initials: string; slug: string; storefrontSlug: string };
export function getAdminStore(slug: string): AdminStore | undefined {
  if (!["firmaadi", "magazaadi", "luma-studio"].includes(slug)) return undefined;
  return { name: slug === "firmaadi" ? "Heer Atelier" : "Luma Studio", initials: slug === "firmaadi" ? "HA" : "LS", slug, storefrontSlug: "luma-studio" };
}
export const operations = [
  { id: "profile", icon: "storefront", title: "Mağaza & Profil Ayarları", description: "Mağaza adı, bio, açılış saatleri ve sosyal medya hesaplarınızı düzenleyin.", status: "Güncel", action: "Profili Düzenle", tone: "green" },
  { id: "supplier", icon: "hub", title: "Tedarikçi & API Bağlantıları", description: "Tedarikçilerinizi bağlayın; ürün, stok ve fiyat akışını tek yerden takip edin.", status: "Bağlantı bekleniyor", action: "Bağlantıları İncele", tone: "blue" },
  { id: "studio", icon: "auto_fix_high", title: "AI Sanal Manken & Stüdyo", description: "Ürünleriniz için yeni bir görünüm oluşturun. Görsellerinizi satışa hazırlayın.", status: "Henüz etkin değil", action: "Stüdyoyu Aç", tone: "blue" },
  { id: "orders", icon: "local_shipping", title: "Sipariş & Gönderi Merkezi", description: "Hazırlanacak siparişler, kargo etiketleri ve teslimat durumları bir arada.", status: "Henüz etkin değil", action: "Siparişleri Gör", tone: "red" },
  { id: "finance", icon: "account_balance_wallet", title: "Cüzdan, Komisyon & Finans", description: "Bakiyenizi, satış gelirlerinizi ve ödeme takviminizi kolayca takip edin.", status: "Henüz etkin değil", action: "Finans Detayları", tone: "blue" },
  { id: "support", icon: "support_agent", title: "Destek & Müşteri Masası", description: "Müşteri mesajları, iade talepleri ve destek görüşmelerinizi yönetin.", status: "Henüz etkin değil", action: "Destek Masası", tone: "green" },
] as const;
export type OperationId = typeof operations[number]["id"];
export const salesSeries = {
  week: { labels: ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"], values: [5200, 7800, 6400, 4900, 6900, 10400, 9200], total: "₺50.800", orders: "38", average: "₺1.337", growth: "+%18,4" },
  month: { labels: ["1 Haz", "5 Haz", "10 Haz", "15 Haz", "20 Haz", "25 Haz", "30 Haz"], values: [21800, 31000, 27300, 19800, 29500, 40200, 35900], total: "₺205.500", orders: "154", average: "₺1.334", growth: "+%22,8" },
};
