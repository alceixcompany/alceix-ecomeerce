import { initialStoreDesign } from "../mocks/store-design";
import type { StoreDesign } from "../types/store-design";

export function defaultStoreDesign(store: { name: string }): StoreDesign {
  const design = initialStoreDesign();
  return {
    ...design,
    announcement: { ...design.announcement, enabled: false, text: "" },
    hero: { title: store.name.slice(0, 100), description: "", buttonLabel: "Ürünleri Keşfet", image: design.hero.image },
    sections: design.sections.map(section => ({ ...section, title: section.kind === "products" ? "Ürünler" : section.title, description: "", visible: ["hero", "products"].includes(section.kind) })),
  };
}
