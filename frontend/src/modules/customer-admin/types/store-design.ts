export const sectionKinds = ["hero", "collections", "products", "testimonials", "instagram", "bento", "video", "faq"] as const;
export type DesignSectionKind = typeof sectionKinds[number];
export type DesignSection = { id: string; kind: DesignSectionKind; title: string; description: string; visible: boolean; videoUrl: string };
export type StoreDesign = {
  announcement: { enabled: boolean; text: string; tone: "blue" | "ink" | "cream" };
  hero: { title: string; description: string; buttonLabel: string; image: string };
  accent: string; background: "white" | "beige"; font: "jakarta" | "inter" | "serif";
  sections: DesignSection[];
};
