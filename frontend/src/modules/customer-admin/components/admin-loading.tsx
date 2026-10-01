import { Skeleton } from "@/components/ui/skeleton";
import "../customer-admin.css";
import "../products.css";
export function AdminLoading() {
  return (
    <div
      className="customer-admin"
      role="status"
      aria-label="Mağaza yönetimi yükleniyor"
      aria-busy="true"
    >
      <aside className="ad-sidebar" aria-hidden="true">
        <Skeleton />
        {Array.from({ length: 7 }, (_, index) => (
          <Skeleton key={index} className="ad-loading-menu" />
        ))}
      </aside>
      <div className="ad-workspace">
        <header className="ad-topbar">
          <Skeleton className="ad-loading-title" />
        </header>
        <main className="ad-main">
          <Skeleton className="ad-loading-title" />
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="ad-loading-card" />
          ))}
        </main>
      </div>
    </div>
  );
}
