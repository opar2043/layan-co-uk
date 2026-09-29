"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Clock, CheckCircle, CreditCard } from "lucide-react";
import { useBookings, useUpdateBookingStatus, useCheckoutBooking } from "@/hooks/useBookings";
import useAuth from "@/components/Auth/useAuth";
import StatusBadge from "@/components/Public/StatusBadge";
import StatCard from "@/components/Dashboard/StatCard";
import CheckoutModal from "@/components/Dashboard/staff/CheckoutModal";
import EmptyState from "@/components/Public/EmptyState";
import { formatCurrency, formatTime, idOf, isFuture } from "@/lib/utils";

/** Statuses a staff member may set on a booking assigned to them. */
const NEXT_STATUSES = {
  pending: ["confirmed", "cancelled", "no_show"],
  confirmed: ["attended", "cancelled", "no_show", "late_cancel"],
  late_cancel: ["attended", "cancelled"],
  cancelled: [],
  no_show: [],
  attended: [],
};

function TodayRow({ booking, onStatus, onCheckout, isMutating }) {
  const options = NEXT_STATUSES[booking.status] ?? [];
  const canCheckout = Number(booking.amountPaid ?? 0) === 0 && options.length > 0;

  return (
    <li className="rounded-xl border border-border px-4 py-3.5">
      <div className="flex flex-wrap items-center gap-3">
        <span className="w-14 shrink-0 text-sm font-bold tabular-nums">
          {formatTime(booking.startTime)}
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{booking.service?.name ?? "Appointment"}</p>
          <p className="truncate text-xs text-muted-foreground">
            {booking.customer?.name ?? "Customer"}
            {booking.customer?.phone ? ` · ${booking.customer.phone}` : ""}
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
              onClick={() => onStatus(booking, next)}
              disabled={isMutating}
              className={`btn-outline btn-sm ${next === "attended" ? "border-success text-success" : ""}`}
            >
              {next.replace(/_/g, " ")}
            </button>
          ))}

          {canCheckout && (
            <button type="button" onClick={() => onCheckout(booking)} className="btn-accent btn-sm">
              <CreditCard size={13} aria-hidden="true" />
              Take payment
            </button>
          )}
        </div>
      )}

      {Number(booking.amountPaid ?? 0) > 0 && (
        <p className="mt-2 text-xs text-success">
          {formatCurrency(booking.amountPaid)} paid
          {booking.tip ? ` + ${formatCurrency(booking.tip)} tip` : ""}
          {booking.paymentMethod ? ` (${booking.paymentMethod})` : ""}
        </p>
      )}
    </li>
  );
}

export default function StaffToday() {
  const { user } = useAuth();
  const { data, isLoading, error } = useBookings({ page: 1, limit: 100 });
  const updateStatus = useUpdateBookingStatus();
  const checkout = useCheckoutBooking();

  // The booking whose checkout dialog is open, or null.
  const [checkingOut, setCheckingOut] = useState(null);

  const bookings = useMemo(() => data?.items ?? [], [data]);
  const today = new Date().toDateString();

  const todays = useMemo(
    () =>
      bookings
        .filter((booking) => new Date(booking.startTime).toDateString() === today)
        .sort((a, b) => new Date(a.startTime) - new Date(b.startTime)),
    [bookings, today]
  );

  const upcoming = useMemo(
    () => bookings.filter((booking) => isFuture(booking.startTime)).length,
    [bookings]
  );
  const completed = useMemo(
    () => bookings.filter((booking) => booking.status === "attended").length,
    [bookings]
  );

  const setStatus = async (booking, status) => {
    await updateStatus.mutateAsync({ id: idOf(booking), status });
  };

  if (error) {
    return <EmptyState icon={CalendarDays} title="Could not load your schedule" description={error.message} />;
  }

  const isMutating = updateStatus.isPending || checkout.isPending;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl sm:text-3xl">
          {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {user?.name ? `Your day, ${user.name}.` : "Your appointments today."}
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Today" value={todays.length} icon={CalendarDays} tone="accent" />
        <StatCard label="Upcoming" value={upcoming} icon={Clock} />
        <StatCard label="Completed" value={completed} icon={CheckCircle} tone="success" />
      </div>

      <section aria-labelledby="today-heading">
        <h2 id="today-heading" className="mb-4 text-lg">
          Today&apos;s schedule
        </h2>

        {isLoading ? (
          <div className="space-y-3" aria-busy="true">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="skeleton h-24 w-full rounded-xl" />
            ))}
          </div>
        ) : todays.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="Nothing booked today"
            description="Appointments assigned to you will appear here on the day."
          />
        ) : (
          <ul className="space-y-3">
            {todays.map((booking) => (
              <TodayRow
                key={idOf(booking)}
                booking={booking}
                onStatus={setStatus}
                onCheckout={setCheckingOut}
                isMutating={isMutating}
              />
            ))}
          </ul>
        )}
      </section>

      {checkingOut && (
        // CheckoutModal owns its own mutation, so it only needs a close callback.
        <CheckoutModal booking={checkingOut} onClose={() => setCheckingOut(null)} />
      )}
    </div>
  );
}
