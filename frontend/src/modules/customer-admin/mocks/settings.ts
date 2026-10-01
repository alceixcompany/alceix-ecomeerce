import type { AdminStore } from "./dashboard";
export type StoreSettings = {
  name: string; company: string; slug: string; bio: string; instagram: string; tiktok: string; whatsapp: string; youtube: string; seoTitle: string; seoDescription: string; isOpen: boolean; mode: "normal" | "maintenance" | "holiday";
};
export function initialSettings(store: AdminStore): StoreSettings {
  return { name: store.name, company: "Heer Tasarım ve Tekstil Ltd. Şti.", slug: store.slug === "firmaadi" ? "heer-atelier" : store.slug, bio: "Zamansız çizgiler, doğal lifler ve etik üretim ilkeleriyle hazırlanan minimalist stüdyo koleksiyonları. İstanbul merkezli bağımsız tasarım atölyesi.", instagram: "heeratelier", tiktok: "heer.style", whatsapp: "+90 532 000 00 00", youtube: "https://youtube.com/@heeratelier", seoTitle: `${store.name} | Özenle seçilmiş koleksiyonlar`, seoDescription: "Zamansız tasarımlar, doğal dokular ve özenle seçilmiş ürünler. Yeni koleksiyonumuzu keşfedin.", isOpen: true, mode: "normal" };
}
export function isStoreSettings(value: unknown): value is StoreSettings {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return ["name","company","slug","bio","instagram","tiktok","whatsapp","youtube","seoTitle","seoDescription"].every(key => typeof record[key] === "string") && typeof record.isOpen === "boolean" && ["normal","maintenance","holiday"].includes(String(record.mode));
}
