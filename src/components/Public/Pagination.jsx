"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { classNames } from "@/lib/utils";

/**
 * Pagination control driven by the backend's `PaginatedData` envelope
 * (`page`, `limit`, `total`, `totalPages`, `hasNextPage`, `hasPrevPage`).
 */
export default function Pagination({ page, totalPages, total, onChange, className }) {
  if (!totalPages || totalPages < 1) return null;

  const pages = [];
  const window = 1;
  for (let i = 1; i <= totalPages; i += 1) {
    if (i === 1 || i === totalPages || Math.abs(i - page) <= window) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "…") {
      pages.push("…");
    }
  }

  const buttonClass =
    "inline-flex h-9 min-w-9 items-center justify-center rounded-xl border border-border px-3 text-sm font-medium transition-colors";

  return (
    <nav
      className={classNames("flex flex-col items-center justify-between gap-4 sm:flex-row", className)}
      aria-label="Pagination"
    >
      <p className="text-sm text-muted-foreground">
        Page <span className="font-semibold text-primary">{page}</span> of{" "}
        <span className="font-semibold text-primary">{totalPages}</span>
        {typeof total === "number" && (
          <>
            {" "}· <span className="font-semibold text-primary">{total}</span> total
          </>
        )}
      </p>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          className={classNames(buttonClass, "disabled:cursor-not-allowed disabled:opacity-40")}
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft size={16} aria-hidden="true" />
        </button>

        {pages.map((entry, index) =>
          entry === "…" ? (
            <span key={`gap-${index}`} className="px-1.5 text-sm text-muted-foreground">
              …
            </span>
          ) : (
            <button
              key={entry}
              type="button"
              onClick={() => onChange(entry)}
              aria-current={entry === page ? "page" : undefined}
              className={classNames(
                buttonClass,
                entry === page
                  ? "border-accent bg-accent text-white"
                  : "bg-surface hover:border-accent hover:text-accent"
              )}
            >
              {entry}
            </button>
          )
        )}

        <button
          type="button"
          className={classNames(buttonClass, "disabled:cursor-not-allowed disabled:opacity-40")}
          onClick={() => onChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
        >
          <ChevronRight size={16} aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
}
