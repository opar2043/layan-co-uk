import Link from "next/link";
import { notFound } from "next/navigation";
import {
  MapPin,
  Clock,
  ArrowLeft,
  BadgeCheck,
  ShieldAlert,
} from "lucide-react";
import { serverGetBusiness, serverListReviews, ApiUnavailableError } from "@/lib/serverApi";
import { formatCurrency, truncate, idOf } from "@/lib/utils";
import Gallery from "@/components/Public/Gallery";
import AmenityList from "@/components/Public/AmenityList";
import MapView from "@/components/Public/MapView";
import Rating from "@/components/Public/Rating";
import ReviewList from "@/components/Public/ReviewCard";
import StatusBadge from "@/components/Public/StatusBadge";
import BookingWidget from "@/components/Public/BookingWidget";
import ShareButton from "@/components/Public/ShareButton";
import WaitlistJoin from "@/components/Public/WaitlistJoin";
import SectionHeading from "@/components/Public/SectionHeading";
import EmptyState from "@/components/Public/EmptyState";

const SITE = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

/**
 * `GET /businesses/:id` runs on the server so the profile's name, description and
 * imagery are in the initial HTML. That is what makes the page crawlable — a
 * client-only render would ship an empty <title> to any bot that does not run JS.
 */
export async function generateMetadata({ params }) {
  const site = SITE;
  const fallback = {
    title: "Business not found",
    description: "This Layan listing is unavailable.",
    robots: { index: false, follow: false },
  };

  try {
    const data = await serverGetBusiness(params.id);
    const business = data?.business;
    if (!business) return fallback;

    const title = business.businessName;
    const description = truncate(
      business.description ||
        `${business.businessName} — ${business.category} in ${business.location?.city ?? "your area"}. Book a slot on Layan.`,
      160
    );
    const image = business.coverImage || business.profileImage || `${site}/opengraph-image`;

    return {
      title,
      description,
      alternates: { canonical: `/businesses/${params.id}` },
      openGraph: {
        type: "website",
        url: `/businesses/${params.id}`,
        title,
        description,
        images: image ? [{ url: image, alt: `${business.businessName} cover photo` }] : undefined,
        locale: "en_GB",
      },
      twitter: { card: "summary_large_image", title, description, images: image ? [image] : undefined },
    };
  } catch {
    return fallback;
  }
}

/** LocalBusiness JSON-LD. Kept to fields the backend actually returns. */
function buildJsonLd(business, services, reviews) {
  const servicesLd = (services ?? []).map((service) => ({
    "@type": "Service",
    name: service.name,
    description: service.description || undefined,
    offers: {
      "@type": "Offer",
      price: service.price,
      priceCurrency: "GBP",
      availability: service.isActive === false
        ? "https://schema.org/SoldOut"
        : "https://schema.org/InStock",
    },
  }));

  const reviewsLd = (reviews ?? []).slice(0, 5).map((review) => ({
    "@type": "Review",
    reviewRating: {
      "@type": "Rating",
      ratingValue: review.ratings?.overall,
      bestRating: 5,
      worstRating: 1,
    },
    author: { "@type": "Person", name: review.customer?.name ?? "Customer" },
    datePublished: review.createdAt,
    reviewBody: truncate(review.comment, 300),
  }));

  return {
    "@context": "https://schema.org",
    "@type": "HairSalon",
    name: business.businessName,
    description: business.description || undefined,
    image: business.coverImage ? [business.coverImage] : undefined,
    url: `${SITE}/businesses/${idOf(business)}`,
    telephone: business.phone || undefined,
    email: business.email || undefined,
    priceRange: servicesLd.length > 0
      ? `${Math.min(...servicesLd.map((s) => s.offers.price))}-${Math.max(...servicesLd.map((s) => s.offers.price))}`
      : undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: business.location?.address,
      addressLocality: business.location?.city,
      addressCountry: "GB",
    },
    geo:
      Number.isFinite(Number(business.location?.latitude)) &&
      Number.isFinite(Number(business.location?.longitude))
        ? {
            "@type": "GeoCoordinates",
            latitude: business.location.latitude,
            longitude: business.location.longitude,
          }
        : undefined,
    aggregateRating: reviewsLd.length > 0
      ? {
          "@type": "AggregateRating",
          ratingValue: (
            reviewsLd.reduce((sum, review) => sum + review.reviewRating.ratingValue, 0) / reviewsLd.length
          ).toFixed(1),
          reviewCount: reviewsLd.length,
        }
      : undefined,
    review: reviewsLd.length > 0 ? reviewsLd : undefined,
    hasOfferCatalog: servicesLd.length > 0
      ? { "@type": "OfferCatalog", name: "Services", itemListElement: servicesLd }
      : undefined,
    openingHours: business.openingHours || undefined,
  };
}

export default async function BusinessProfilePage({ params }) {
  let business = null;
  let services = [];
  let reviews = [];
  let apiDown = false;

  try {
    const data = await serverGetBusiness(params.id);
    business = data?.business ?? null;
    services = data?.business?.services ?? [];
  } catch (error) {
    if (error instanceof ApiUnavailableError) apiDown = true;
    else notFound();
  }

  if (!business) {
    if (apiDown) {
      return (
        <div className="container-page py-20">
          <EmptyState
            icon={ShieldAlert}
            title="Booking service unavailable"
            description="We could not reach the Layan API. Start the layan-salon backend and refresh this page."
          />
        </div>
      );
    }
    notFound();
  }

  // Reviews are nice-to-have: a failure here must not blank the profile.
  try {
    const result = await serverListReviews(params.id, { limit: 20 }, { tolerateFailure: true });
    reviews = result?.items ?? [];
  } catch {
    reviews = [];
  }

  const activeServices = services.filter((service) => service.isActive !== false);
  // Public, active-only roster (the backend excludes passwordHash, timeOff and
  // commissionRate) — the only staff data a signed-out visitor can obtain.
  const bookableStaff = Array.isArray(business.staff) ? business.staff : [];
  const fromPrice = activeServices.length
    ? Math.min(...activeServices.map((service) => Number(service.price)))
    : null;
  const rating = business.aggregates?.averageRating ?? business.rating ?? null;
  const reviewCount = business.aggregates?.reviewCount ?? business.reviewCount ?? reviews.length;

  const jsonLd = buildJsonLd(business, activeServices, reviews);

  return (
    <>
      <script
        type="application/ld+json"
        // Structured data must be a literal JSON document, not a React element.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container-page py-6 sm:py-10">
        <nav aria-label="Breadcrumb" className="mb-5">
          <Link
            href="/search"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-accent"
          >
            <ArrowLeft size={15} aria-hidden="true" />
            Back to search
          </Link>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* ---------------- main column ---------------- */}
          <div>
            <header className="mb-6">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                {business.isBusinessVerified && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 text-[11px] font-semibold text-success ring-1 ring-inset ring-success/20">
                    <BadgeCheck size={13} aria-hidden="true" />
                    Layan verified
                  </span>
                )}
                {business.verificationStatus && business.verificationStatus !== "approved" && (
                  <StatusBadge status={business.verificationStatus} />
                )}
                {business.instantBookEnabled && <StatusBadge status="active" label="Instant book" />}
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] lg:leading-tight">
                {business.businessName}
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                <span className="font-medium text-primary">{business.category}</span>
                {rating !== null && rating > 0 && <Rating value={rating} count={reviewCount} />}
                {business.location?.city && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin size={14} aria-hidden="true" />
                    {business.location.city}
                  </span>
                )}
                {fromPrice !== null && Number.isFinite(fromPrice) && (
                  <span>
                    from{" "}
                    <span className="font-semibold text-accent">{formatCurrency(fromPrice)}</span>
                  </span>
                )}
              </div>

              {business.badges?.length > 0 && (
                <ul className="mt-4 flex flex-wrap gap-2">
                  {business.badges.map((badge) => (
                    <li
                      key={badge}
                      className="rounded-full bg-accent-light px-3 py-1 text-[11px] font-semibold text-accent"
                    >
                      {badge}
                    </li>
                  ))}
                </ul>
              )}
            </header>

            <Gallery
              images={[business.coverImage, ...(business.portfolio ?? [])].filter(Boolean)}
              alt={business.businessName}
              className="mb-8"
            />

            {business.description && (
              <section className="card mb-8" aria-labelledby="about-heading">
                <h2 id="about-heading" className="mb-3 text-lg">
                  About
                </h2>
                <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                  {business.description}
                </p>
              </section>
            )}

            <section className="card mb-8" aria-labelledby="services-heading">
              <SectionHeading
                eyebrow="Menu"
                title="Services"
                description={`${activeServices.length} ${activeServices.length === 1 ? "service" : "services"} available for online booking`}
                className="mb-5"
              />
              <h2 id="services-heading" className="sr-only">
                Services
              </h2>

              {activeServices.length === 0 ? (
                <EmptyState
                  compact
                  icon={Clock}
                  title="No services published"
                  description="This business has not listed any services yet, so it cannot be booked online."
                />
              ) : (
                <ul className="divide-y divide-border">
                  {activeServices.map((service) => (
                    <li
                      key={idOf(service)}
                      className="flex items-start justify-between gap-5 py-4 first:pt-0 last:pb-0"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold">{service.name}</p>
                        {service.description && (
                          <p className="mt-1 text-sm text-muted-foreground">{service.description}</p>
                        )}
                        <p className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock size={12} aria-hidden="true" />
                          {service.durationMinutes} minutes
                        </p>
                      </div>
                      <p className="shrink-0 text-base font-semibold text-accent">
                        {formatCurrency(service.price)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <div className="mb-8 grid gap-6 sm:grid-cols-2">
              <section className="card" aria-labelledby="location-heading">
                <h2 id="location-heading" className="mb-4 text-lg">
                  Location
                </h2>
                <MapView location={business.location} />
              </section>

              <section className="card" aria-labelledby="policies-heading">
                <h2 id="policies-heading" className="mb-4 text-lg">
                  Good to know
                </h2>
                <dl className="space-y-4 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Opening hours</dt>
                    <dd className="mt-0.5 font-medium">{business.openingHours || "Not provided"}</dd>
                  </div>
                  {business.cancellationPolicy && (
                    <div>
                      <dt className="text-muted-foreground">Cancellation policy</dt>
                      <dd className="mt-0.5 font-medium">{business.cancellationPolicy}</dd>
                    </div>
                  )}
                  {business.bookingUrl && (
                    <div>
                      <dt className="text-muted-foreground">External booking</dt>
                      <dd className="mt-0.5">
                        <a
                          href={business.bookingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-accent hover:underline"
                        >
                          {business.bookingUrl}
                        </a>
                      </dd>
                    </div>
                  )}
                </dl>

                {business.amenities?.length > 0 && (
                  <div className="mt-5 border-t border-border pt-5">
                    <h3 className="mb-3 text-sm font-semibold">Amenities</h3>
                    <AmenityList amenities={business.amenities} className="flex flex-wrap gap-2" />
                  </div>
                )}
              </section>
            </div>

            <section aria-labelledby="reviews-heading">
              <SectionHeading
                eyebrow="Feedback"
                title="Reviews"
                description={
                  reviewCount > 0
                    ? `${reviewCount} ${reviewCount === 1 ? "review" : "reviews"} from verified appointments`
                    : "No reviews yet"
                }
                className="mb-5"
              />
              <h2 id="reviews-heading" className="sr-only">
                Reviews
              </h2>
              <ReviewList reviews={reviews} />
            </section>
          </div>

          {/* ---------------- booking rail ---------------- */}
          <aside className="hidden lg:block" aria-label="Book an appointment">
            <div className="sticky top-24 space-y-5">
              <BookingWidget business={business} services={activeServices} staff={bookableStaff} />
              <WaitlistJoin business={business} services={activeServices} staff={bookableStaff} />
              <ShareButton title={business.businessName} />
            </div>
          </aside>
        </div>
      </div>

      {/* ---------------- mobile sticky CTA ---------------- */}
      <div className="sticky-cta">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{business.businessName}</p>
            <p className="text-xs text-muted-foreground">
              {fromPrice !== null && Number.isFinite(fromPrice)
                ? `from ${formatCurrency(fromPrice)}`
                : business.category}
            </p>
          </div>
          <a href="#book" className="btn-accent shrink-0">
            Book now
          </a>
        </div>
      </div>

      {/* The mobile booking widget lives after the content, not in a fixed rail. */}
      <div id="book" className="container-page pb-28 pt-4 sm:hidden">
        <BookingWidget business={business} services={activeServices} staff={bookableStaff} />
      </div>
    </>
  );
}
