import Hero from "@/components/Layout/Hero";
import FeaturedBusinesses from "@/components/Layout/FeaturedBusinesses";
import DiscoveryFeed from "@/components/Layout/DiscoveryFeed";
import PopularCategories from "@/components/Layout/PopularCategories";
import HowItWorksSection from "@/components/Layout/HowItWorksSection";
import Testimonials from "@/components/Layout/Testimonials";
import ListYourBusinessCta from "@/components/Layout/ListYourBusinessCta";
import NewsletterBanner from "@/components/Layout/NewsletterBanner";
import { serverListBusinesses, serverGetBusiness } from "@/lib/serverApi";

export const metadata = {
  title: "Book your next salon appointment",
  description:
    "Layan is a booking marketplace for salons, barbers and nail bars. Discover verified businesses near you, compare services and book a slot in seconds.",
  alternates: { canonical: "/" },
};

/**
 * Home page.
 *
 * Fetched on the server so the discovery grid is in the initial HTML — good for
 * SEO and it means the page has content before hydration. If the API is down the
 * page still renders (with a null list) rather than erroring out.
 */
export default async function HomePage() {
  let businesses = [];
  let feed = [];

  try {
    const result = await serverListBusinesses({ limit: 12, sort: "score" });
    businesses = result?.items ?? [];

    // The portfolio feed has no dedicated endpoint, so it fans out over a handful
    // of the businesses above. Capped at 8 detail calls.
    const withPortfolio = businesses.slice(0, 8);
    const details = await Promise.all(
      withPortfolio.map((business) =>
        serverGetBusiness(business._id).catch(() => null)
      )
    );
    feed = details
      .filter(Boolean)
      .map((detail) => ({
        business: detail.business,
        images: detail.business?.portfolio ?? [],
      }))
      .filter((entry) => entry.images.length > 0);
  } catch (error) {
    // Logged, not thrown: the marketing page must survive a stopped backend.
    console.warn("[home] business feed unavailable:", error.message);
  }

  return (
    <>
      <Hero />
      <FeaturedBusinesses
        businesses={businesses}
        eyebrow="Discover"
        title="Top rated this week"
        description="Ranked by the Layan Business Score, which blends review ratings, attendance and response times."
      />
      <DiscoveryFeed items={feed} />
      <PopularCategories />
      <HowItWorksSection />
      <Testimonials />
      <ListYourBusinessCta />
      <NewsletterBanner />
    </>
  );
}
