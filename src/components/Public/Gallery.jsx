import { classNames } from "@/lib/utils";

/**
 * Business portfolio gallery. Falls back to a neutral panel when the business has
 * no images, rather than rendering a broken <img>.
 */
export default function Gallery({ images = [], alt = "Portfolio", columns = 3, className }) {
  const items = images.filter(Boolean);

  if (items.length === 0) {
    return (
      <div
        className={classNames(
          "flex aspect-[16/9] items-center justify-center rounded-2xl bg-muted text-sm text-muted-foreground",
          className
        )}
      >
        No photos yet
      </div>
    );
  }

  return (
    <div
      className={classNames("grid gap-2 sm:gap-3", className)}
      style={{ gridTemplateColumns: `repeat(${Math.min(columns, Math.max(items.length, 1))}, minmax(0, 1fr))` }}
    >
      {items.slice(0, columns).map((src, index) => (
        <div
          key={`${src}-${index}`}
          className="aspect-square overflow-hidden rounded-2xl bg-muted first:col-span-2 first:aspect-[2/1] sm:first:col-span-1 sm:first:aspect-square"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={`${alt} photo ${index + 1}`}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
          />
        </div>
      ))}
    </div>
  );
}
