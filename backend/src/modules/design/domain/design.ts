export type StoreDesign = {
  announcement: {
    enabled: boolean;
    text: string;
    tone: "blue" | "ink" | "cream";
  };
  hero: {
    title: string;
    description: string;
    buttonLabel: string;
    image: string;
  };
  accent: string;
  background: "white" | "beige";
  font: "jakarta" | "inter" | "serif";
  sections: {
    id: string;
    kind:
      | "hero"
      | "collections"
      | "products"
      | "testimonials"
      | "instagram"
      | "bento"
      | "video"
      | "faq";
    title: string;
    description: string;
    visible: boolean;
    videoUrl: string;
  }[];
};
export type DesignRecord = {
  storeId: string;
  version: number;
  draft: StoreDesign;
  published?: StoreDesign;
  updatedAt: Date;
  publishedAt?: Date;
};
