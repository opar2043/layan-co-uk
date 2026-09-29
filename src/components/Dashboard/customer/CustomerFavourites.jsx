"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useQueries } from "@tanstack/react-query";
import { Heart, MapPin } from "lucide-react";
import { useMyProfile, useToggleFavourite } from "@/hooks/useUsers";
import api from "@/lib/axios";
import API from "@/lib/endpoints";
import { CardSkeleton } from "@/components/Public/CardSkeleton";
import EmptyState from "@/components/Public/EmptyState";
import Rating from "@/components/Public/Rating";
import { idOf, initials } from "@/lib/utils";

/** A saved business, with the option to remove it. */
function FavouriteBusinessCard({ business, onRemove, isRemoving }) {
  const cover = business?.coverImage || business?.profileImage;
  const rating = business?.aggregates?.averageRating ?? business?.rating ?? 0;

  return (
    <article className="flex gap-4 rounded-2xl bg-surface p-4 shadow-card">
      <Link
        href={`/businesses/${idOf(business)}`}
        className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-muted"
      >
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt={`${business.businessName} cover photo`}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-lg font-bold text-accent">
            {initials(business?.businessName)}
          </span>
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          <h3 className="truncate font-semibold">
            <Link href={`/businesses/${idOf(business)}`} className="hover:text-accent">
              {business?.businessName ?? "Business"}
            </Link>
          </h3>
          <p className="mt-0.5 truncate text-sm text-muted-foreground">{business?.category}</p>
          {business?.location?.city && (
            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin size={11} aria-hidden="true" />
              {business.location.city}
            </p>
          )}
          {rating > 0 && <Rating value={rating} size={12} showValue={false} className="mt-1.5" />}
        </div>

        <button
          type="button"
          onClick={() => onRemove(idOf(business))}
          disabled={isRemoving}
          className="btn-ghost btn-sm mt-2 self-start text-danger hover:bg-danger/10"
        >
          <Heart size={13} className="fill-danger" aria-hidden="true" />
          Remove
        </button>
      </div>
    </article>
  );
}

/**
 * Favourites.
 *
 * The customer profile stores favourite business *ids*, not whole documents, so
 * each card needs its own `GET /businesses/:id`. `useQueries` runs them
 * concurrently with per-item loading and error handling; a business that fails to
 * load is dropped rather than rendered as a broken card.
 */
export default function CustomerFavourites() {
  const { data: profileData, isLoading: profileLoading } = useMyProfile();
  const toggle = useToggleFavourite();

  const ids = useMemo(
    () => profileData?.user?.favouriteBusinessIds ?? [],
    [profileData]
  );

  const queries = useQueries({
    queries: ids.map((id) => ({
      queryKey: ["businesses", "detail", id],
      queryFn: () => api.get(API.businessById(id)),
      enabled: Boolean(id),
      staleTime: 60_000,
    })),
  });

  const businesses = queries
    .map((query) => query.data?.business)
    .filter(Boolean);

  const isLoading =
    profileLoading || (ids.length > 0 && businesses.length === 0 && queries.some((q) => q.isLoading));

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl sm:text-3xl">Saved businesses</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {ids.length > 0
            ? `${ids.length} ${ids.length === 1 ? "business" : "businesses"} saved.`
            : "Salons you save are kept here for next time."}
        </p>
      </header>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2" aria-busy="true">
          {Array.from({ length: 4 }).map((_, index) => (
            <CardSkeleton key={index} />
          ))}
        </div>
      ) : ids.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="No saved businesses yet"
          description="Tap the heart on any salon or barber you like and it will be waiting here."
          action={
            <Link href="/search" className="btn-primary btn-sm">
              Browse businesses
            </Link>
          }
        />
      ) : businesses.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="These businesses are no longer available"
          description="One or more of the businesses you saved could not be loaded. Removing them will clear the entry."
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {businesses.map((business) => (
            <li key={idOf(business)}>
              <FavouriteBusinessCard
                business={business}
                onRemove={(id) => toggle.mutate({ businessId: id, action: "remove" })}
                isRemoving={toggle.isPending}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
