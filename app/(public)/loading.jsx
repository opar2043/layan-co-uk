import { BusinessCardSkeleton } from "@/components/Public/CardSkeleton";
import { Skeleton } from "@/components/Public/CardSkeleton";

/** Route-level loading UI for the public section. */
export default function PublicLoading() {
  return (
    <div className="container-page py-16 sm:py-24" aria-busy="true" aria-label="Loading">
      <div className="mx-auto max-w-3xl text-center">
        <Skeleton className="mx-auto mb-5 h-7 w-48 rounded-full" />
        <Skeleton className="mx-auto mb-4 h-12 w-full" />
        <Skeleton className="mx-auto mb-3 h-12 w-4/5" />
        <Skeleton className="mx-auto h-5 w-full" />
        <Skeleton className="mx-auto mt-9 h-14 w-full max-w-2xl rounded-2xl" />
      </div>

      <div className="mt-20 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <BusinessCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
