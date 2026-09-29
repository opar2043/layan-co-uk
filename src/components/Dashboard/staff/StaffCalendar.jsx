"use client";

import { useMemo, useState } from "react";
import { CalendarDays, CreditCard } from "lucide-react";
import { useBookings, useUpdateBookingStatus } from "@/hooks/useBookings";
import CalendarBoard from "@/components/Dashboard/BookingsTable";
import CheckoutModal from "@/components/Dashboard/staff/CheckoutModal";
import EmptyState from "@/components/Public/EmptyState";
import StatusBadge from "@/components/Public/StatusBadge";
import {
  formatCurrency, formatDate, formatTime, idOf, isFuture,
} from "@/lib/utils";

/** Statuses a staff member may set on their own bookings. */
const NEXT_STATUSES = {
  pending: ["confirmed", "cancelled", "no_show"],
  confirmed: ["attended", "cancelled", "no_show", "late_cancel"],
  late_cancel: ["attended", "cancelled"],
  cancelled: [],
  no_show: [],
  attended: [],
};

export default function StaffCalendar() {
  // The board needs a wide window, so it gets a large page rather than paginating.
  const { data, isLoading, error } = useBookings({ page: 1, limit: 200 });
  const update = useUpdateBookingStatus();
  const [checkingOut, setCheckingOut] = useState(null);

  const bookings = useMemo(() => data?.items ?? [], [data]);

  if (error) {
    return <EmptyState icon={CalendarDays} title="Could not load your bookings" description={error.message} />;
  }

  const setStatus = async (booking, status) => {
    await update.mutateAsync({ id: idOf(booking), status });
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl sm:text-3xl">Calendar</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Only appointments assigned to you appear here.
        </p>
      </header>

      <CalendarBoard
        bookings={bookings}
        loading={isLoading}
        initialView="week"
        isMutating={update.isPending}
        onStatusChange={setStatus}
        canCheckout
        onCheckout={setCheckingOut}
      />

      <section aria-labelledby="upcoming-heading">
        <h2 id="upcoming-heading" className="mb-4 text-lg">
          Coming up
        </h2>

        {bookings.filter((booking) => isFuture(booking.startTime)).length === 0 ? (
          <p className="rounded-xl bg-muted px-4 py-8 text-center text-sm text-muted-foreground">
            No upcoming appointments assigned to you.
          </p>
        ) : (
          <ul className="space-y-3">
            {bookings
              .filter((booking) => isFuture(booking.startTime))
              .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
              .map((booking) => {
                const options = NEXT_STATUSES[booking.status] ?? [];
                return (
                  <li key={idOf(booking)} className="rounded-2xl bg-surface p-4 shadow-card">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="w-28 shrink-0">
                        <p className="text-sm font-semibold">{formatDate(booking.startTime)}</p>
                        <p className="text-xs text-muted-foreground">{formatTime(booking.startTime)}</p>
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {booking.service?.name ?? "Appointment"}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {booking.customer?.name ?? "Customer"}
                        </p>
                      </div>

                      <p className="text-sm font-semibold text-accent tabular-nums">
                        {formatCurrency(booking.totalPrice ?? 0)}
                      </p>
                      <StatusBadge status={booking.status} />
                    </div>

                    {options.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">
                        {options.map((next) => (
                          <button
                            key={next}
                            type="button"
                            onClick={() => setStatus(booking, next)}
                            disabled={update.isPending}
                            className={`btn-outline btn-sm ${
                              next === "attended" ? "border-success text-success" : ""
                            }`}
                          >
                            {next.replace(/_/g, " ")}
                          </button>
                        ))}
                        {Number(booking.amountPaid ?? 0) === 0 && (
                          <button
                            type="button"
                            onClick={() => setCheckingOut(booking)}
                            className="btn-accent btn-sm"
                          >
                            <CreditCard size={13} aria-hidden="true" />
                            Take payment
                          </button>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
          </ul>
        )}
      </section>

      {checkingOut && (
        <CheckoutModal booking={checkingOut} onClose={() => setCheckingOut(null)} />
      )}
    </div>
  );
}
