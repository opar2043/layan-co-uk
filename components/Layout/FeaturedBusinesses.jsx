import Link from "next/link";
import { ArrowRight } from "lucide-react";
import SectionHeading from "@/components/Public/SectionHeading";
import BusinessCard from "@/components/Public/BusinessCard";
import { BusinessCardSkeleton } from "@/components/Public/CardSkeleton";
import EmptyState from "@/components/Public/EmptyState";
import { Store } from "lucide-react";

/**
 * Server-rendered grid of verified businesses.
 *
 * `title`/`description` are passed in so the home page can frame the same grid
 * differently from the search page. `businesses` is the already-unwrapped array.
 */
export default function FeaturedBusinesses({
  businesses = [],
  loading = false,
  title = "Recently joined",
  description = "Fresh listings from verified salons, barbers and nail bars.",
  eyebrow,
  viewAllHref = "/search",
  limit = 8,
}) {
  const shown = businesses.slice(0, limit);

  return (
    <section className="container-page py-16 sm:py-20" aria-labelledby="featured-businesses">
      <SectionHeading
        eyebrow={eyebrow}
        title={title}
        description={description}
        action={
          <Link href={viewAllHref} className="btn-outline btn-sm">
            View all
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        }
      />
      <h2 id="featured-businesses" className="sr-only">
        {title}
      </h2>

      {loading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <BusinessCardSkeleton key={index} />
          ))}
        </div>
      ) : shown.length === 0 ? (
        <EmptyState
          icon={Store}
          title="No businesses to show yet"
          description="Once businesses are verified by our team they will appear here."
          action={
            <Link href="/register?role=owner" className="btn-primary btn-sm">
              List your business
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {shown.map((business, index) => (
            <BusinessCard key={business._id ?? business.id ?? index} business={business} priority={index < 4} />
          ))}
        </div>
      )}
    </section>
  );
}
