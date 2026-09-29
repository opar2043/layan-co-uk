"use client";

import { useState } from "react";
import { Search, MapPin, SlidersHorizontal, X } from "lucide-react";
import { CATEGORIES, SORT_OPTIONS } from "@/lib/constants";
import { classNames } from "@/lib/utils";

/** Discovery search input. Uncontrolled on submit so typing does not refetch. */
export function SearchBar({ initialValue = "", onSearch, placeholder = "Search salons, barbers, nail bars…", autoFocus = false }) {
  const [value, setValue] = useState(initialValue);

  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        onSearch?.(value.trim());
      }}
      className="relative w-full"
    >
      <label htmlFor="business-search" className="sr-only">
        Search businesses
      </label>
      <Search
        size={18}
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <input
        id="business-search"
        type="search"
        value={value}
        autoFocus={autoFocus}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        className="input h-13 py-3.5 pl-12 pr-28"
      />
      <button type="submit" className="btn-primary absolute right-1.5 top-1/2 -translate-y-1/2 py-2">
        Search
      </button>
    </form>
  );
}

/** Compact search + city used in the site header. */
export function CitySearch({ onSearch, initialValue = "" }) {
  const [city, setCity] = useState(initialValue);
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSearch?.(city.trim());
      }}
      className="relative"
    >
      <label htmlFor="city-search" className="sr-only">
        City
      </label>
      <MapPin size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
      <input
        id="city-search"
        type="text"
        value={city}
        onChange={(event) => setCity(event.target.value)}
        placeholder="City"
        className="input py-2.5 pl-10 text-sm"
      />
    </form>
  );
}

/**
 * Filter sidebar for /search. Also rendered inline (rather than in a drawer) on
 * desktop, so the same markup serves both breakpoints.
 */
export function FilterSidebar({ filters, onChange, onReset, resultCount }) {
  const [city, setCity] = useState(filters.city ?? "");
  const [query, setQuery] = useState(filters.q ?? "");

  const set = (patch) => onChange({ ...filters, ...patch, page: 1 });

  const hasFilters = Boolean(filters.category || filters.city || filters.q || filters.instantBook);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <SlidersHorizontal size={16} className="text-accent" aria-hidden="true" />
          Filters
        </h2>
        {hasFilters && (
          <button
            type="button"
            onClick={() => {
              setCity("");
              setQuery("");
              onReset?.();
            }}
            className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-danger"
          >
            <X size={13} aria-hidden="true" />
            Clear
          </button>
        )}
      </div>

      <div>
        <label htmlFor="filter-city" className="label">
          City
        </label>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            set({ city });
          }}
        >
          <input
            id="filter-city"
            type="text"
            value={city}
            onChange={(event) => setCity(event.target.value)}
            placeholder="e.g. Birmingham"
            className="input"
          />
        </form>
      </div>

      <fieldset>
        <legend className="label">Category</legend>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((category) => {
            const active = filters.category === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => set({ category: active ? "" : category })}
                aria-pressed={active}
                className={`chip ${active ? "chip-active" : ""}`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div>
        <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3">
          <span className="text-sm font-medium">Instant book only</span>
          <input
            type="checkbox"
            checked={Boolean(filters.instantBook)}
            onChange={(event) => set({ instantBook: event.target.checked ? "true" : "" })}
            className="h-4 w-4 shrink-0 rounded accent-[#8B5E3C]"
          />
        </label>
      </div>

      <div>
        <label htmlFor="filter-sort" className="label">
          Sort by
        </label>
        <select
          id="filter-sort"
          value={filters.sort ?? "newest"}
          onChange={(event) => set({ sort: event.target.value })}
          className="input"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {typeof resultCount === "number" && (
        <p className="border-t border-border pt-4 text-xs text-muted-foreground">
          {resultCount} {resultCount === 1 ? "business" : "businesses"} found
        </p>
      )}
    </div>
  );
}

export default SearchBar;
