export type ListQuery = {
  q: string;
  category: string;
  status: "all" | "live" | "draft" | "critical";
  sort: "newest" | "price-asc" | "price-desc" | "stock" | "name" | "featured";
  availability: "all" | "in-stock" | "out-of-stock";
  model: "all" | "own" | "supplier";
  page: number;
  limit: number;
  min?: number;
  max?: number;
};
