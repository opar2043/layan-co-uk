import Link from "next/link";
import Carousel, { CarouselItem } from "@/components/Public/Carousel";
import { BusinessCardSkeleton } from "@/components/Public/CardSkeleton";
import EmptyState from "@/components/Public/EmptyState";
import { Camera } from "lucide-react";
import { idOf } from "@/lib/utils";

/**
 * Portfolio-image feed — "Book this look".
 *
 * There is no dedicated portfolio feed endpoint on the backend, so this is built
 * by fanning out over the verified businesses already fetched and flattening
 * their `portfolio` arrays. `limit` caps how many business detail requests the
 * caller is willing to make.
 *
 * If no business has uploaded portfolio images yet (the common case on a fresh
 * database) this renders an honest empty state rather than a row of grey boxes.
 */
export default function DiscoveryFeed({ items = [], loading = false, title = "Book this look" }) {
  const withImages = items.filter((item) => item?.images?.length > 0);

  if (loading) {
    return (
      <section className="container-page py-16 sm:py-20">
        <h2 className="mb-6 text-2xl">{title}</h2>
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="w-[240px] shrink-0 sm:w-[300px]">
              <BusinessCardSkeleton />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (withImages.length === 0) {
    return (
      <section className="container-page py-16 sm:py-20">
        <EmptyState
          icon={Camera}
          title="No portfolio photos yet"
          description="Businesses publish their work here once they add pictures to their profile."
        />
      </section>
    );
  }

  return (
    <section className="container-page py-16 sm:py-20">
      <Carousel
        title={title}
        action={
          <Link href="/search" className="text-sm font-medium text-accent hover:underline">
            See more
          </Link>
        }
      >
        {withImages.map((item) =>
          item.images.slice(0, 6).map((image, index) => (
            <CarouselItem key={`${idOf(item.business)}-${index}`}>
              <Link
                href={`/businesses/${idOf(item.business)}`}
                className="group block overflow-hidden rounded-2xl bg-surface shadow-card transition-shadow hover:shadow-card-hover"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image}
                    alt={`Work by ${item.business?.businessName ?? "this business"}`}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <p className="truncate text-sm font-semibold">{item.business?.businessName}</p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {item.business?.category}
                    {item.business?.location?.city ? ` · ${item.business.location.city}` : ""}
                  </p>
                  <span className="mt-3 inline-flex rounded-lg bg-accent-light px-2.5 py-1 text-[11px] font-semibold text-accent">
                    Book this look
                  </span>
                </div>
              </Link>
            </CarouselItem>
          ))
        )}
      </Carousel>
    </section>
  );
}
