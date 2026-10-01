import { paginationPages } from "@/lib/pagination";
export function Pagination({
  page,
  pageCount,
  onChange,
  disabled = false,
  className,
  label = "Ürün sayfaları",
}: {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
  disabled?: boolean;
  className?: string;
  label?: string;
}) {
  return (
    <nav className={className} aria-label={label}>
      <button
        type="button"
        disabled={disabled || page <= 1}
        onClick={() => onChange(page - 1)}
      >
        Önceki
      </button>
      {paginationPages(page, pageCount).map((number, index) =>
        number === null ? (
          <span key={`gap-${index}`} aria-hidden="true">
            …
          </span>
        ) : (
          <button
            type="button"
            key={number}
            disabled={disabled}
            aria-label={`${number}. sayfa`}
            aria-current={page === number ? "page" : undefined}
            onClick={() => onChange(number)}
          >
            {number}
          </button>
        ),
      )}
      <button
        type="button"
        disabled={disabled || page >= pageCount}
        onClick={() => onChange(page + 1)}
      >
        Sonraki
      </button>
    </nav>
  );
}
