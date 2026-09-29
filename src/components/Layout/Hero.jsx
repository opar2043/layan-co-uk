"use client";

import { useRouter } from "next/navigation";
import { Search, MapPin, Star } from "lucide-react";
import { useState } from "react";
import { CATEGORIES } from "@/lib/constants";

/** Home hero. Sends visitors straight into the discovery flow. */
export default function Hero() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");

  const go = (path) => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (city.trim()) params.set("city", city.trim());
    const search = params.toString();
    router.push(path + (search ? `?${search}` : ""));
  };

  return (
    <section className="relative overflow-hidden border-b border-border bg-background">
      {/* Soft warm wash, kept behind the content with no imagery to download. */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,#F3E7DA_0%,transparent_70%)]"
        aria-hidden="true"
      />

      <div className="container-page relative py-16 sm:py-24 lg:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-card">
            <Star size={13} className="fill-accent text-accent" aria-hidden="true" />
            Verified businesses only
          </p>

          <h1 className="text-4xl leading-[1.08] sm:text-5xl lg:text-6xl">
            Book your next salon
            <br />
            <span className="text-accent">appointment in seconds</span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Compare salons, barbers and nail bars near you. Pick a service, choose a time, and turn up.
          </p>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              go("/search");
            }}
            className="mx-auto mt-9 max-w-2xl"
            role="search"
          >
            <div className="flex flex-col gap-2.5 rounded-2xl bg-surface p-2.5 shadow-card sm:flex-row">
              <div className="relative flex-1">
                <label htmlFor="hero-search" className="sr-only">
                  Search businesses
                </label>
                <Search
                  size={17}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <input
                  id="hero-search"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Salon, barber, nail bar…"
                  className="w-full rounded-xl border-0 py-3 pl-11 pr-4 text-sm outline-none placeholder:text-muted-foreground/70"
                />
              </div>

              <div className="relative sm:w-48">
                <label htmlFor="hero-city" className="sr-only">
                  City
                </label>
                <MapPin
                  size={17}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <input
                  id="hero-city"
                  type="text"
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  placeholder="City"
                  className="w-full rounded-xl border-0 py-3 pl-11 pr-4 text-sm outline-none placeholder:text-muted-foreground/70"
                />
              </div>

              <button type="submit" className="btn-primary px-8">
                Search
              </button>
            </div>
          </form>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-muted-foreground">Popular:</span>
            {CATEGORIES.slice(0, 4).map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => go(`/search?category=${encodeURIComponent(category)}`)}
                className="chip"
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
