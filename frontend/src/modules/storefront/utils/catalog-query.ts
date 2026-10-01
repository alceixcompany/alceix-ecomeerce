export const STOREFRONT_PAGE_SIZE = 24;
const sorts = ["featured", "price-asc", "price-desc", "name"];
const price = (value: string | null) => {
  if (!value?.trim()) return undefined;
  const amount = Number(value.replace(",", "."));
  return Number.isFinite(amount) && amount >= 0 && amount <= 99_999_999.99
    ? Math.round(amount * 100)
    : undefined;
};
export function catalogQuery(params: URLSearchParams) {
  const minimum = price(params.get("min")),
    maximum = price(params.get("max"));
  const invalidRange =
    minimum !== undefined && maximum !== undefined && minimum > maximum;
  const rawPage = Number(params.get("page")),
    page = Number.isSafeInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  const query = new URLSearchParams({
    limit: String(STOREFRONT_PAGE_SIZE),
    page: String(page),
    q: (params.get("q") || "").slice(0, 120),
    category: (params.get("category") || "all").slice(0, 40),
    sort: sorts.includes(params.get("sort") || "")
      ? params.get("sort")!
      : "featured",
    availability:
      params.get("availability") === "in-stock" ? "in-stock" : "all",
  });
  if (!invalidRange && minimum !== undefined) query.set("min", String(minimum));
  if (!invalidRange && maximum !== undefined) query.set("max", String(maximum));
  return { query, invalidRange };
}
