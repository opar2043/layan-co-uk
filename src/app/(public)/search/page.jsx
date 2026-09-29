import { Suspense } from "react";
import SearchClient from "./SearchClient";

export const metadata = {
  title: "Find a salon, barber or nail bar",
  description:
    "Search verified salons, barbers and nail bars by service, city or category. Filter by instant booking and sort by rating.",
  alternates: { canonical: "/search" },
  openGraph: {
    title: "Find a salon, barber or nail bar | Layan",
    description: "Search verified beauty businesses and book a slot in seconds.",
    url: "/search",
  },
};

export default function SearchPage() {
  // SearchClient reads searchParams through useSearchParams, which requires a
  // Suspense boundary during the static shell.
  return (
    <Suspense fallback={<SearchPageSkeleton />}>
      <SearchClient />
    </Suspense>
  );
}

function SearchPageSkeleton() {
  return (
    <div className="container-page py-10 sm:py-14" aria-busy="true">
      <div className="skeleton mb-3 h-10 w-64 rounded-xl" />
      <div className="skeleton mb-8 h-14 w-full rounded-xl" />
      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <div className="skeleton hidden h-96 rounded-2xl lg:block" />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="skeleton h-80 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
