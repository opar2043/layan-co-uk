"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { classNames } from "@/lib/utils";

/**
 * Horizontally scrollable track with optional arrows. `peek` keeps the next item
 * partially visible on desktop, which is the standard discovery-grid affordance.
 */
export default function Carousel({ children, title, action, peek = true }) {
  const [track, setTrack] = useState(null);

  const scrollBy = (direction) => {
    if (!track) return;
    const amount = track.clientWidth * 0.8;
    track.scrollBy({ left: direction * amount, behavior: "smooth" });
  };

  return (
    <section aria-labelledby={title ? `carousel-${title}` : undefined}>
      {(title || action) && (
        <div className="mb-5 flex items-end justify-between gap-4">
          {title && (
            <h2 id={`carousel-${title}`} className="text-xl sm:text-2xl">
              {title}
            </h2>
          )}
          {action}
        </div>
      )}

      <div className="group relative">
        <div
          ref={setTrack}
          className={classNames(
            "-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0",
            "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          )}
        >
          {children}
        </div>

        {/* Arrows only on pointer devices — a swipe is the mobile interaction. */}
        {peek && (
          <>
            <button
              type="button"
              onClick={() => scrollBy(-1)}
              aria-label={`Scroll ${title ?? "carousel"} left`}
              className="absolute -left-4 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface text-primary opacity-0 shadow-card transition-opacity hover:text-accent focus-visible:opacity-100 group-hover:opacity-100 md:flex"
            >
              <ChevronLeft size={18} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => scrollBy(1)}
              aria-label={`Scroll ${title ?? "carousel"} right`}
              className="absolute -right-4 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface text-primary opacity-0 shadow-card transition-opacity hover:text-accent focus-visible:opacity-100 group-hover:opacity-100 md:flex"
            >
              <ChevronRight size={18} aria-hidden="true" />
            </button>
          </>
        )}
      </div>
    </section>
  );
}

export function CarouselItem({ children, className }) {
  return (
    <div className={classNames("w-[240px] shrink-0 snap-start sm:w-[300px]", className)}>
      {children}
    </div>
  );
}
