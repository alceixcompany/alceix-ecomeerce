export function adminCatalogQuery(search: string, limit = 6) {
  const source = new URLSearchParams(search),
    query = new URLSearchParams();
  for (const key of [
    "q",
    "category",
    "status",
    "sort",
    "page",
    "availability",
    "model",
  ]) {
    const value = source.get(key);
    if (value) query.set(key, value);
  }
  const values = ["min", "max"].map((key) => {
    const value = source.get(key);
    if (!value?.trim()) return undefined;
    const number = Number(value.replace(",", "."));
    return Number.isFinite(number) && number >= 0 && number <= 99_999_999.99
      ? Math.round(number * 100)
      : undefined;
  });
  values.forEach((value, index) => {
    if (value !== undefined)
      query.set(index === 0 ? "min" : "max", String(value));
  });
  query.set("limit", String(limit));
  return {
    query,
    invalidRange:
      values[0] !== undefined &&
      values[1] !== undefined &&
      values[0] > values[1],
  };
}
