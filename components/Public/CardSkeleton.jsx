import { classNames } from "@/lib/utils";

/**
 * Loading placeholder. `variant` mirrors the shape of the content it stands in
 * for, which keeps the layout from jumping when real data lands.
 */
export function Skeleton({ className }) {
  return <div className={classNames("skeleton", className)} aria-hidden="true" />;
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl bg-surface p-4 shadow-card" aria-hidden="true">
      <Skeleton className="mb-4 aspect-[4/3] w-full" />
      <Skeleton className="mb-2.5 h-4 w-3/4" />
      <Skeleton className="mb-2.5 h-3 w-1/2" />
      <div className="mt-4 flex items-center justify-between">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-4 w-14" />
      </div>
    </div>
  );
}

export function BusinessCardSkeleton() {
  return (
    <div className="rounded-2xl bg-surface p-4 shadow-card" aria-hidden="true">
      <Skeleton className="mb-4 aspect-[4/3] w-full" />
      <Skeleton className="mb-3 h-5 w-2/3" />
      <Skeleton className="mb-2 h-3 w-1/2" />
      <Skeleton className="mb-4 h-3 w-1/3" />
      <div className="flex items-center justify-between border-t border-border pt-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="rounded-2xl bg-surface p-4 shadow-card" aria-hidden="true">
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex gap-4">
            {Array.from({ length: cols }).map((__, colIndex) => (
              <Skeleton
                key={colIndex}
                className="h-4 flex-1"
                // Vary the widths so it does not read as a rigid grid.
                {...{ style: { opacity: 1 - rowIndex * 0.12 } }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-2xl bg-surface p-5 shadow-card" aria-hidden="true">
      <Skeleton className="mb-3 h-3 w-24" />
      <Skeleton className="mb-2 h-7 w-20" />
      <Skeleton className="h-3 w-28" />
    </div>
  );
}

export default CardSkeleton;
