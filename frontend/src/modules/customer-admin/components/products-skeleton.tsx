import { Skeleton } from "@/components/ui/skeleton";
export function ProductsSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }, (_, index) => (
        <tr key={index} aria-hidden="true">
          <td>
            <div className="ap-product-detail">
              <Skeleton className="ap-row-image" />
              <div className="ap-skeleton-detail">
                <Skeleton />
                <Skeleton />
              </div>
            </div>
          </td>
          <td>
            <Skeleton />
          </td>
          <td>
            <Skeleton />
          </td>
          <td>
            <Skeleton />
          </td>
          <td>
            <Skeleton />
          </td>
        </tr>
      ))}
    </>
  );
}
