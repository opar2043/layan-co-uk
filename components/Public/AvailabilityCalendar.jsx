"use client";

import { useMemo } from "react";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { addDays, startOfToday, toDateInput, classNames } from "@/lib/utils";

/**
 * Horizontal date strip for the booking widget.
 *
 * The backend has no availability endpoint, so this only picks a day; slot
 * conflicts are caught server-side on submit and surfaced as a 409. See README
 * "Known gaps" — a real availability route would replace the generated grid.
 */
export default function AvailabilityCalendar({
  value,
  onChange,
  days = 14,
  from,
  disabled = false,
}) {
  const start = useMemo(() => startOfToday(from), [from]);

  const dates = useMemo(
    () => Array.from({ length: days }, (_, index) => addDays(start, index)),
    [start, days]
  );

  const shift = (amount) => onChange?.(toDateInput(addDays(value ? new Date(value) : start, amount)));

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <CalendarDays size={16} className="text-accent" aria-hidden="true" />
          Choose a date
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => shift(-1)}
            disabled={disabled || new Date(value || toDateInput(start)) <= start}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Previous day"
          >
            <ChevronLeft size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => shift(1)}
            disabled={disabled}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Next day"
          >
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div
        className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="radiogroup"
        aria-label="Available dates"
      >
        {dates.map((date) => {
          const iso = toDateInput(date);
          const selected = value === iso;
          const isToday = iso === toDateInput(start);
          return (
            <button
              key={iso}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange?.(iso)}
              disabled={disabled}
              className={classNames(
                "flex min-w-[68px] shrink-0 flex-col items-center gap-0.5 rounded-xl border px-3 py-2.5 transition-all",
                selected
                  ? "border-accent bg-accent text-white shadow-card"
                  : "border-border bg-surface hover:border-accent",
                disabled && "cursor-not-allowed opacity-50"
              )}
            >
              <span className={classNames("text-[11px] uppercase tracking-wide", selected ? "text-white/80" : "text-muted-foreground")}>
                {isToday ? "Today" : new Intl.DateTimeFormat("en-GB", { weekday: "short" }).format(date)}
              </span>
              <span className="text-base font-semibold">{date.getDate()}</span>
              <span className={classNames("text-[10px]", selected ? "text-white/80" : "text-muted-foreground")}>
                {new Intl.DateTimeFormat("en-GB", { month: "short" }).format(date)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
