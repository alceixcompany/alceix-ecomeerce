import type { AdminStore } from "./dashboard";
import type {ProfileSettings as StoreSettings} from "@/modules/admin-editors";
export type {ProfileSettings as StoreSettings} from "@/modules/admin-editors";
export {isProfileSettings as isStoreSettings} from "@/modules/admin-editors";
export function initialSettings(store: AdminStore): StoreSettings {
  return { name: store.name, company: "Heer Tasarım ve Tekstil Ltd. Şti.", slug: store.slug === "firmaadi" ? "heer-atelier" : store.slug, bio: "Zamansız çizgiler, doğal lifler ve etik üretim ilkeleriyle hazırlanan minimalist stüdyo koleksiyonları. İstanbul merkezli bağımsız tasarım atölyesi.", instagram: "heeratelier", tiktok: "heer.style", whatsapp: "+90 532 000 00 00", youtube: "https://youtube.com/@heeratelier", seoTitle: `${store.name} | Özenle seçilmiş koleksiyonlar`, seoDescription: "Zamansız tasarımlar, doğal dokular ve özenle seçilmiş ürünler. Yeni koleksiyonumuzu keşfedin.", isOpen: true, mode: "normal" };
}
