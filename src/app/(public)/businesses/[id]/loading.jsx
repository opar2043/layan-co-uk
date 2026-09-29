import { Skeleton, BusinessCardSkeleton } from "@/components/Public/CardSkeleton";

export default function BusinessLoading() {
  return (
    <div className="container-page py-10" aria-busy="true" aria-label="Loading business">
      <Skeleton className="mb-6 h-5 w-32" />

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div>
          <Skeleton className="mb-3 h-6 w-40" />
          <Skeleton className="mb-4 h-11 w-2/3" />
          <Skeleton className="mb-6 h-5 w-1/2" />
          <Skeleton className="mb-8 aspect-[16/9] w-full rounded-2xl" />
          <Skeleton className="mb-8 h-64 w-full rounded-2xl" />
          <div className="grid gap-5 sm:grid-cols-2">
            <Skeleton className="h-56 rounded-2xl" />
            <Skeleton className="h-56 rounded-2xl" />
          </div>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-4">
            <div className="rounded-2xl bg-surface p-6 shadow-card">
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={index} className="h-14 w-full rounded-xl" />
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
