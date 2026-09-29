"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, Store, X } from "lucide-react";
import { useSearchBusinesses } from "@/hooks/useBusinesses";
import { useToggleFavourite, useFavouriteIds } from "@/hooks/useUsers";
import BusinessCard from "@/components/Public/BusinessCard";
import { BusinessCardSkeleton } from "@/components/Public/CardSkeleton";
import EmptyState from "@/components/Public/EmptyState";
import Pagination from "@/components/Public/Pagination";
import { FilterSidebar, SearchBar } from "@/components/Public/SearchBar";

const EMPTY = { q: "", city: "", category: "", instantBook: "", sort: "newest", page: 1, limit: 12 };

/** Reads the initial filter state out of the URL so results are shareable. */
function useFiltersFromUrl() {
  const params = useSearchParams();
  return useMemo(
    () => ({
      q: params.get("q") ?? "",
      city: params.get("city") ?? "",
      category: params.get("category") ?? "",
      instantBook: params.get("instantBook") ?? "",
      sort: params.get("sort") ?? "newest",
      page: Number(params.get("page") ?? 1) || 1,
      limit: 12,
    }),
    [params]
  );
}

export default function SearchClient() {
  const router = useRouter();
  const urlFilters = useFiltersFromUrl();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [search, setSearch] = useState(urlFilters.q);
  const toggleFavourite = useToggleFavourite();
  const favouriteIds = useFavouriteIds();

  useEffect(() => setSearch(urlFilters.q), [urlFilters.q]);

  // Filter state lives in the URL, so back/forward and sharing both work.
  const setFilters = useCallback(
    (next) => {
      const merged = { ...urlFilters, ...next };
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(merged)) {
        if (value === "" || value === undefined || value === null) continue;
        if (key === "page" && value === 1) continue;
        params.set(key, String(value));
      }
      const query = params.toString();
      router.replace(query ? `/search?${query}` : "/search", { scroll: false });
    },
    [router, urlFilters]
  );

  const { data, isLoading, isFetching, error } = useSearchBusinesses(urlFilters);
  const businesses = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const hasFilters = Boolean(urlFilters.q || urlFilters.city || urlFilters.category || urlFilters.instantBook);

  return (
    <div className="container-page py-10 sm:py-14">
      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl">Find a salon</h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          {isLoading ? "Searching…" : `${total} verified ${total === 1 ? "business" : "businesses"} found`}
        </p>
      </header>

      <div className="mb-8 flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <SearchBar
            initialValue={urlFilters.q}
            onSearch={(value) => setFilters({ q: value, page: 1 })}
          />
        </div>
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="btn-outline lg:hidden"
        >
          <SlidersHorizontal size={15} aria-hidden="true" />
          Filters
          {hasFilters && <span className="ml-1 h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />}
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block" aria-label="Filters">
          <div className="sticky top-24 rounded-2xl bg-surface p-5 shadow-card">
            <FilterSidebar
              filters={urlFilters}
              onChange={setFilters}
              onReset={() => setFilters(EMPTY)}
              resultCount={isLoading ? undefined : total}
            />
          </div>
        </aside>

        <section aria-label="Search results" aria-busy={isLoading}>
          {error ? (
            <EmptyState
              icon={Store}
              title="Could not load businesses"
              description={error.message || "The API did not respond. Is the layan-salon backend running?"}
              action={
                <button type="button" onClick={() => setFilters({ page: urlFilters.page })} className="btn-primary btn-sm">
                  Try again
                </button>
              }
            />
          ) : isLoading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <BusinessCardSkeleton key={index} />
              ))}
            </div>
          ) : businesses.length === 0 ? (
            <EmptyState
              icon={Store}
              title={hasFilters ? "No matches" : "No businesses yet"}
              description={
                hasFilters
                  ? "Try widening your search — remove a filter or search a nearby city."
                  : "Once businesses finish verification they will appear here."
              }
              action={
                hasFilters ? (
                  <button type="button" onClick={() => setFilters(EMPTY)} className="btn-outline btn-sm">
                    Clear all filters
                  </button>
                ) : null
              }
            />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {businesses.map((business, index) => {
                  const id = business._id ?? business.id;
                  return (
                    <BusinessCard
                      key={id ?? index}
                      business={business}
                      priority={index < 3}
                      isFavourite={favouriteIds.includes(id)}
                      onToggleFavourite={(businessId) =>
                        toggleFavourite.mutate({
                          businessId,
                          action: favouriteIds.includes(businessId) ? "remove" : "add",
                        })
                      }
                    />
                  );
                })}
              </div>

              <Pagination
                className="mt-10"
                page={data?.page ?? 1}
                totalPages={totalPages}
                total={total}
                onChange={(page) => {
                  setFilters({ page });
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            </>
          )}

          {isFetching && !isLoading && (
            <p className="mt-4 text-center text-xs text-muted-foreground" role="status">
              Updating results…
            </p>
          )}
        </section>
      </div>

      {/* Mobile filter sheet */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          <div
            className="absolute inset-0 bg-primary/40 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-surface p-6 shadow-pop">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg">Filters</h2>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
                aria-label="Close filters"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            <FilterSidebar
              filters={urlFilters}
              onChange={setFilters}
              onReset={() => setFilters(EMPTY)}
              resultCount={isLoading ? undefined : total}
            />
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="btn-primary mt-6 w-full"
            >
              Show {total} {total === 1 ? "result" : "results"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
