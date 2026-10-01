export function paginationPages(
  page: number,
  pageCount: number,
): (number | null)[] {
  const total = Math.max(1, Math.floor(pageCount));
  const current = Math.min(total, Math.max(1, Math.floor(page)));
  const pages = new Set([1, total]);
  for (
    let number = Math.max(1, current - 2);
    number <= Math.min(total, current + 2);
    number++
  )
    pages.add(number);
  const sorted = [...pages].sort((a, b) => a - b),
    result: (number | null)[] = [];
  sorted.forEach((number, index) => {
    const previous = sorted[index - 1];
    if (previous !== undefined && number - previous > 1) result.push(null);
    result.push(number);
  });
  return result;
}
