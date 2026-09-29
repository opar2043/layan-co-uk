"use client";

import { Star } from "lucide-react";
import { classNames } from "@/lib/utils";

/**
 * Star rating. Shows a half-star via a clipped overlay rather than pulling in a
 * rating library for what is five divs.
 */
export default function Rating({ value = 0, count, size = 14, showValue = true, className }) {
  const rating = Number(value) || 0;
  const rounded = Math.round(rating * 2) / 2;

  return (
    <div className={classNames("flex items-center gap-1.5", className)}>
      <div
        className="flex items-center gap-0.5"
        role="img"
        aria-label={`Rated ${rating.toFixed(1)} out of 5${count ? ` from ${count} reviews` : ""}`}
      >
        {[1, 2, 3, 4, 5].map((position) => {
          const filled = rounded >= position;
          const half = !filled && rounded >= position - 0.5;
          return (
            <span key={position} className="relative inline-block" style={{ width: size, height: size }}>
              <Star size={size} className="absolute inset-0 text-border" aria-hidden="true" />
              {(filled || half) && (
                <span
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: half ? size / 2 : size }}
                  aria-hidden="true"
                >
                  <Star size={size} className="fill-accent text-accent" />
                </span>
              )}
            </span>
          );
        })}
      </div>
      {showValue && rating > 0 && (
        <span className="text-sm font-semibold text-primary">{rating.toFixed(1)}</span>
      )}
      {count !== undefined && count !== null && (
        <span className="text-xs text-muted-foreground">
          ({count} {count === 1 ? "review" : "reviews"})
        </span>
      )}
    </div>
  );
}
