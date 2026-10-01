import { Skeleton } from "@/components/ui/skeleton";
export function CatalogSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      className="sf-product-grid"
      role="status"
      aria-label="Ürünler yükleniyor"
    >
      {Array.from({ length: count }, (_, index) => (
        <article className="sf-product" key={index} aria-hidden="true">
          <Skeleton className="sf-product-image" />
          <div className="sf-product-info">
            <Skeleton />
            <Skeleton className="sf-skeleton-title" />
            <Skeleton className="sf-skeleton-price" />
            <Skeleton className="sf-skeleton-actions" />
          </div>
        </article>
      ))}
    </div>
  );
}
