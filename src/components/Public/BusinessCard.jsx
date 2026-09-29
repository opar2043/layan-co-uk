import Link from "next/link";
import { CalendarDays, MapPin, Heart } from "lucide-react";
import Rating from "./Rating";
import StatusBadge from "./StatusBadge";
import { formatCurrency, idOf, initials, classNames } from "@/lib/utils";

function initialsColour(seed) {
  // Deterministic pastel from the name so a business keeps the same avatar tint.
  const palette = [
    "bg-accent-light text-accent",
    "bg-success/10 text-success",
    "bg-warning/10 text-warning",
    "bg-muted text-muted-foreground",
  ];
  let hash = 0;
  for (let i = 0; i < String(seed).length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) % 997;
  return palette[hash % palette.length];
}

/**
 * Discovery-grid card for a business.
 *
 * The API does not expose a pre-aggregated `rating` or `reviewCount` on the
 * business document, so those come from `business.aggregates` when present and
 * otherwise fall back to the Layan Business Score. Prices come from the cheapest
 * active service when the business was fetched with `?withServices`.
 */
export default function BusinessCard({ business, isFavourite = false, onToggleFavourite, priority = false }) {
  const id = idOf(business);
  const aggregates = business?.aggregates ?? {};
  const rating = aggregates.averageRating ?? business?.rating ?? 0;
  const reviewCount = aggregates.reviewCount ?? business?.reviewCount ?? 0;

  const services = Array.isArray(business?.services) ? business.services : [];
  const from =
    services.length > 0
      ? Math.min(...services.map((service) => Number(service.price ?? Infinity)))
      : null;

  const cover = business?.coverImage || business?.profileImage;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl bg-surface shadow-card transition-shadow duration-200 hover:shadow-card-hover">
      <Link
        href={id ? `/businesses/${id}` : "#"}
        className="flex flex-1 flex-col focus-visible:ring-0"
        aria-label={`View ${business?.businessName ?? "business"}`}
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cover}
              alt={`${business.businessName} — cover photo`}
              loading={priority ? "eager" : "lazy"}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span
                className={classNames(
                  "flex h-16 w-16 items-center justify-center rounded-2xl text-xl font-bold",
                  initialsColour(business?.businessName ?? "Layan")
                )}
                aria-hidden="true"
              >
                {initials(business?.businessName)}
              </span>
            </div>
          )}

          {business?.instantBookEnabled && (
            <span className="absolute left-3 top-3 rounded-full bg-surface/95 px-2.5 py-1 text-[11px] font-semibold text-success shadow-card backdrop-blur">
              Instant book
            </span>
          )}

          {business?.verificationStatus === "pending" && (
            <span className="absolute right-3 top-3">
              <StatusBadge status="pending" label="Awaiting approval" />
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-4 sm:p-5">
          <div className="mb-1.5 flex items-start justify-between gap-3">
            <h3 className="line-clamp-1 text-base font-semibold">{business?.businessName ?? "Unnamed"}</h3>
            {rating > 0 && <Rating value={rating} count={reviewCount} size={13} showValue={false} />}
          </div>

          <p className="mb-2 line-clamp-1 text-sm text-muted-foreground">
            {business?.category || "Salon"}
            {business?.location?.city ? ` · ${business.location.city}` : ""}
          </p>

          <div className="mt-auto flex items-end justify-between gap-3 border-t border-border pt-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin size={13} aria-hidden="true" />
              <span className="line-clamp-1">{business?.location?.address || business?.location?.city || "—"}</span>
            </div>
            {from !== null && Number.isFinite(from) && (
              <p className="shrink-0 text-sm">
                <span className="text-xs text-muted-foreground">from </span>
                <span className="font-semibold text-accent">{formatCurrency(from)}</span>
              </p>
            )}
          </div>
        </div>
      </Link>

      {onToggleFavourite && (
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onToggleFavourite(id);
          }}
          className="absolute right-3 top-3 rounded-full bg-surface/95 p-2 shadow-card backdrop-blur transition-colors hover:text-danger"
          aria-label={isFavourite ? `Remove ${business?.businessName} from favourites` : `Save ${business?.businessName} to favourites`}
          aria-pressed={isFavourite}
        >
          <Heart
            size={16}
            className={isFavourite ? "fill-danger text-danger" : "text-muted-foreground"}
            aria-hidden="true"
          />
        </button>
      )}
    </article>
  );
}
