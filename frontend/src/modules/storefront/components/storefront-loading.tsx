import { Skeleton } from "@/components/ui/skeleton";
import { CatalogSkeleton } from "./catalog-skeleton";
import "../storefront.css";
export function StorefrontLoading() {
  return (
    <div className="storefront" aria-busy="true">
      <div className="sf-announcement">
        <Skeleton className="sf-skeleton-announcement" />
      </div>
      <header className="sf-header">
        <div className="sf-container sf-header-inner">
          <Skeleton className="sf-skeleton-brand" />
        </div>
      </header>
      <main className="sf-container">
        <section
          className="sf-hero sf-skeleton-hero"
          aria-label="Mağaza yükleniyor"
        >
          <Skeleton />
        </section>
        <CatalogSkeleton />
      </main>
    </div>
  );
}
