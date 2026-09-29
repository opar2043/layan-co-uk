"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Clock, Loader2 } from "lucide-react";
import StatusBadge from "@/components/Public/StatusBadge";
import PaymentCheckout from "@/components/Dashboard/staff/CheckoutModal";
import {
  addDays,
  durationMinutes,
  formatCurrency,
  formatDate,
  formatTime,
  idOf,
  toDateInput,
} from "@/lib/utils";

/** Statuses that still occupy a slot in the diary. */
const BLOCKING = new Set(["pending", "confirmed", "attended"]);

const DAILY_WINDOW = {
  fromHour: 8,
  toHour: 20,
};

/**
 * Group bookings into a day, then lay each one out on a time grid.
 *
 * This is client-side layout over whatever bookings were fetched — the backend
 * has no calendar/availability endpoint, so a "real" slot grid would be invented.
 * It shows what was actually booked, which is the part that matters.
 */
export function groupBookingsByDay(bookings = []) {
  const groups = new Map();
  for (const booking of bookings) {
    const start = new Date(booking.startTime);
    if (Number.isNaN(start.getTime())) continue;
    const key = toDateInput(start);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(booking);
  }

  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, items]) => ({
      date,
      items: items.sort(
        (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      ),
    }));
}

/**
 * Day / week booking board.
 *
 * `onStatusChange` is optional — customers get the read-only variant (cancel only),
 * businesses get the full status controls, staff get checkout.
 */
export default function CalendarBoard({
  bookings = [],
  loading = false,
  initialView = "day",
  onStatusChange,
  onCheckout,
  isMutating = false,
  canCheckout = false,
  emptyTitle = "No bookings in this view",
  emptyDescription = "Bookings will appear here as customers make them.",
}) {
  // The day/week toggle is owned here, not by the parent: no caller needs to know
  // which day is anchored, so exposing `view`/`setView` would be dead API surface.
  const [view, setView] = useState(initialView);
  const [anchor, setAnchor] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState(() => toDateInput());

  const days = useMemo(() => {
    const count = view === "week" ? 7 : 1;
    return Array.from({ length: count }, (_, index) => toDateInput(addDays(anchor, index)));
  }, [anchor, view]);

  const grouped = useMemo(() => groupBookingsByDay(bookings), [bookings]);
  const activeBookings = useMemo(
    () => grouped.filter((group) => group.items.some((booking) => BLOCKING.has(booking.status))),
    [grouped]
  );

  const shift = (amount) => {
    const next = addDays(anchor, view === "week" ? amount * 7 : amount);
    setAnchor(next);
    setSelectedDay(toDateInput(next));
  };

  if (loading) {
    return (
      <div className="rounded-2xl bg-surface p-5 shadow-card" aria-busy="true">
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="skeleton h-16 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const shown = view === "week" ? days : [selectedDay];

  return (
    <div className="space-y-5">
      {/* ---------------- toolbar ---------------- */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-surface p-4 shadow-card">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => shift(-1)}
            className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-primary"
          >
            ← Prev
          </button>
          <button
            type="button"
            onClick={() => {
              setAnchor(new Date());
              setSelectedDay(toDateInput());
            }}
            className="rounded-lg px-3 py-2 text-sm font-medium text-accent hover:bg-accent-light"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => shift(1)}
            className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-primary"
          >
            Next →
          </button>
        </div>

        <div className="flex items-center gap-1 rounded-xl bg-muted p-1">
          {["day", "week"].map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setView(option)}
              aria-pressed={view === option}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                view === option ? "bg-surface text-primary shadow-card" : "text-muted-foreground"
              }`}
            >
              {option === "day" ? "Day" : "Week"}
            </button>
          ))}
        </div>

        <p className="text-sm font-medium text-muted-foreground">
          {view === "week"
            ? `Week of ${formatDate(days[0])}`
            : formatDate(shown[0])}
        </p>
      </div>

      {/* ---------------- board ---------------- */}
      {shown.every((day) => !grouped.some((group) => group.date === day)) ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface/50 px-6 py-14 text-center">
          <CalendarDays size={26} className="mx-auto mb-3 text-muted-foreground" aria-hidden="true" />
          <h3 className="text-base font-semibold">{emptyTitle}</h3>
          <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">{emptyDescription}</p>
        </div>
      ) : (
        <div className="space-y-5">
          {shown.map((day) => {
            const group = grouped.find((entry) => entry.date === day);
            const items = group?.items ?? [];
            const dayTotal = items
              .filter((booking) => BLOCKING.has(booking.status))
              .reduce((sum, booking) => sum + Number(booking.totalPrice ?? 0), 0);

            return (
              <section key={day} aria-labelledby={`day-${day}`}>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 id={`day-${day}`} className="text-base">
                    {formatDate(day)}
                    {day === toDateInput() && (
                      <span className="ml-2 rounded-full bg-accent-light px-2 py-0.5 text-[11px] font-semibold text-accent">
                        Today
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {items.length} {items.length === 1 ? "booking" : "bookings"}
                    {dayTotal > 0 && ` · ${formatCurrency(dayTotal)}`}
                  </p>
                </div>

                {items.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
                    Nothing booked
                  </p>
                ) : (
                  <ul className="space-y-2.5">
                    {items.map((booking) => (
                      <li
                        key={idOf(booking)}
                        className="rounded-2xl bg-surface p-4 shadow-card sm:p-5"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-start gap-4">
                            <div className="flex w-16 shrink-0 flex-col items-center rounded-xl bg-muted py-2">
                              <Clock size={14} className="text-accent" aria-hidden="true" />
                              <span className="mt-0.5 text-sm font-bold tabular-nums">
                                {formatTime(booking.startTime)}
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                {durationMinutes(booking.startTime, booking.endTime)}m
                              </span>
                            </div>

                            <div className="min-w-0">
                              <p className="font-semibold">
                                {booking.service?.name ?? "Service"}
                              </p>
                              <p className="mt-0.5 text-sm text-muted-foreground">
                                {booking.customer?.name ?? "Customer"}
                                {booking.staff?.name ? ` · with ${booking.staff.name}` : " · any staff"}
                              </p>
                              <div className="mt-2 flex flex-wrap items-center gap-2">
                                <StatusBadge status={booking.status} />
                                {booking.paymentMethod && (
                                  <StatusBadge status={booking.paymentMethod} size="sm" />
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                            <p className="text-base font-semibold text-accent">
                              {formatCurrency(booking.totalPrice ?? 0)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Paid {formatCurrency(booking.amountPaid ?? 0)}
                            </p>
                          </div>
                        </div>

                        {(onStatusChange || onCheckout) && (
                          <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-3.5">
                            {onStatusChange && booking.status === "pending" && (
                              <button
                                type="button"
                                disabled={isMutating}
                                onClick={() => onStatusChange(booking, "confirmed")}
                                className="btn-accent btn-sm"
                              >
                                {isMutating ? <Loader2 size={13} className="animate-spin" aria-hidden="true" /> : "Confirm"}
                              </button>
                            )}
                            {onStatusChange && booking.status === "confirmed" && (
                              <>
                                <button
                                  type="button"
                                  disabled={isMutating}
                                  onClick={() => onStatusChange(booking, "attended")}
                                  className="btn-accent btn-sm"
                                >
                                  Mark attended
                                </button>
                                <button
                                  type="button"
                                  disabled={isMutating}
                                  onClick={() => onStatusChange(booking, "no_show")}
                                  className="btn-outline btn-sm"
                                >
                                  No-show
                                </button>
                              </>
                            )}
                            {onStatusChange && ["pending", "confirmed"].includes(booking.status) && (
                              <button
                                type="button"
                                disabled={isMutating}
                                onClick={() => onStatusChange(booking, "cancelled")}
                                className="btn-ghost btn-sm"
                              >
                                Cancel
                              </button>
                            )}
                            {canCheckout && onCheckout && ["confirmed", "attended"].includes(booking.status) && (
                              <button
                                type="button"
                                onClick={() => onCheckout(booking)}
                                className="btn-outline btn-sm"
                              >
                                Checkout
                              </button>
                            )}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      )}

      {/* Cancelled / no-show appointments stay visible for the full window. */}
      {activeBookings.length === 0 && grouped.length > 0 && (
        <details className="rounded-2xl bg-surface p-4 shadow-card">
          <summary className="cursor-pointer text-sm font-semibold text-muted-foreground">
            Show cancelled &amp; no-show appointments ({grouped.reduce((sum, group) => sum + group.items.filter((b) => !BLOCKING.has(b.status)).length, 0)})
          </summary>
          <ul className="mt-3 space-y-2">
            {grouped
              .flatMap((group) => group.items)
              .filter((booking) => !BLOCKING.has(booking.status))
              .map((booking) => (
                <li
                  key={idOf(booking)}
                  className="flex items-center justify-between gap-3 rounded-xl bg-muted/60 px-3.5 py-2.5 text-sm"
                >
                  <span>
                    {formatDate(booking.startTime)} at {formatTime(booking.startTime)} ·{" "}
                    {booking.service?.name ?? "Service"}
                  </span>
                  <StatusBadge status={booking.status} />
                </li>
              ))}
          </ul>
        </details>
      )}
    </div>
  );
}
