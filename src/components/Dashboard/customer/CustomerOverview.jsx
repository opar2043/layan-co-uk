"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, Clock, Store, Loader2, XCircle } from "lucide-react";
import { useBookings, useUpdateBookingStatus } from "@/hooks/useBookings";
import { useFavouriteIds } from "@/hooks/useUsers";
import { useWallet } from "@/hooks/useWallet";
import StatusBadge from "@/components/Public/StatusBadge";
import EmptyState from "@/components/Public/EmptyState";
import StatCard from "@/components/Dashboard/StatCard";
import { formatCurrency, formatDate, formatTime, idOf, isFuture } from "@/lib/utils";
import { BOOKING_STATUSES } from "@/lib/constants";

/** One upcoming appointment, with the only action a customer actually has. */
export function UpcomingBookingCard({ booking, onCancel, isCancelling }) {
  const start = new Date(booking.startTime);
  const past = !isFuture(booking.startTime);

  return (
    <article className="rounded-2xl bg-surface p-5 shadow-card">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex w-16 shrink-0 flex-col items-center rounded-xl bg-muted py-2.5">
            <span className="text-[10px] font-semibold uppercase text-muted-foreground">
              {new Intl.DateTimeFormat("en-GB", { month: "short" }).format(start)}
            </span>
            <span className="text-xl font-bold leading-tight">{start.getDate()}</span>
            <span className="text-[10px] text-muted-foreground">{formatTime(start)}</span>
          </div>

          <div className="min-w-0">
            <h3 className="font-semibold">
              {booking.service?.name ?? "Appointment"}
            </h3>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {booking.business?.businessName ?? "Salon"}
              {booking.business?.location?.city ? ` · ${booking.business.location.city}` : ""}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <StatusBadge status={booking.status} />
              {booking.paymentMethod && <StatusBadge status={booking.paymentMethod} size="sm" />}
            </div>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <p className="text-base font-semibold text-accent">
            {formatCurrency(booking.totalPrice ?? 0)}
          </p>
          {Number(booking.amountPaid ?? 0) > 0 && (
            <p className="text-xs text-muted-foreground">
              {formatCurrency(booking.amountPaid ?? 0)} paid
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-3.5">
        {booking.business?._id && (
          <Link
            href={`/businesses/${idOf(booking.business)}`}
            className="btn-outline btn-sm"
          >
            View business
          </Link>
        )}
        {!past && ["pending", "confirmed"].includes(booking.status) && onCancel && (
          <button
            type="button"
            onClick={() => onCancel(booking)}
            disabled={isCancelling}
            className="btn-ghost btn-sm text-danger hover:bg-danger/10"
          >
            <XCircle size={14} aria-hidden="true" />
            Cancel booking
          </button>
        )}
      </div>
    </article>
  );
}

const UPCOMING = ["pending", "confirmed"];

export default function CustomerOverview() {
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);

  // The API scopes the list to the signed-in customer automatically.
  const { data, isLoading, error } = useBookings({ page, limit: 20, status: filter || undefined });
  const updateStatus = useUpdateBookingStatus();
  const favouriteIds = useFavouriteIds();
  const { data: walletData } = useWallet();

  const bookings = useMemo(() => data?.items ?? [], [data]);
  const wallet = walletData?.wallet ?? walletData;

  const upcoming = useMemo(
    () =>
      bookings
        .filter((booking) => UPCOMING.includes(booking.status) && isFuture(booking.startTime))
        .sort((a, b) => new Date(a.startTime) - new Date(b.startTime)),
    [bookings]
  );

  const past = bookings.filter((booking) => !upcoming.includes(booking));

  const cancel = async (booking) => {
    // The API narrows customers to cancel-only on their own bookings.
    await updateStatus.mutateAsync({ id: idOf(booking), status: "cancelled" });
  };

  if (error) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="Could not load your bookings"
        description={error.message}
      />
    );
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl sm:text-3xl">Your appointments</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Everything you have booked through Layan.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Upcoming" value={upcoming.length} icon={CalendarDays} tone="accent" />
        <StatCard label="Total bookings" value={data?.total ?? 0} icon={Clock} />
        <StatCard
          label="Wallet balance"
          value={formatCurrency(wallet?.loyaltyBalance ?? 0)}
          icon={Store}
          hint={`${favouriteIds.length} saved`}
        />
      </div>

      <section aria-labelledby="upcoming-heading">
        <h2 id="upcoming-heading" className="mb-4 text-lg">
          Coming up
        </h2>

        {isLoading ? (
          <div className="space-y-3" aria-busy="true">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="skeleton h-32 w-full rounded-2xl" />
            ))}
          </div>
        ) : upcoming.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="No upcoming appointments"
            description="When you book a salon, your appointment will show up here with everything you need to know."
            action={
              <Link href="/search" className="btn-primary btn-sm">
                Find a salon
              </Link>
            }
          />
        ) : (
          <div className="space-y-3">
            {upcoming.map((booking) => (
              <UpcomingBookingCard
                key={idOf(booking)}
                booking={booking}
                onCancel={cancel}
                isCancelling={updateStatus.isPending}
              />
            ))}
          </div>
        )}
      </section>

      {past.length > 0 && (
        <section aria-labelledby="history-heading">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 id="history-heading" className="text-lg">
              History
            </h2>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setFilter("");
                  setPage(1);
                }}
                aria-pressed={!filter}
                className={`chip ${!filter ? "chip-active" : ""}`}
              >
                All
              </button>
              {BOOKING_STATUSES.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => {
                    setFilter(status);
                    setPage(1);
                  }}
                  aria-pressed={filter === status}
                  className={`chip ${filter === status ? "chip-active" : ""}`}
                >
                  {status.replace(/_/g, " ")}
                </button>
              ))}
            </div>
          </div>

          <div className="table-wrap rounded-2xl bg-surface p-2 shadow-card sm:p-4">
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">Date</th>
                  <th scope="col">Service</th>
                  <th scope="col">Business</th>
                  <th scope="col">Status</th>
                  <th scope="col" className="text-right">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {past.map((booking) => (
                  <tr key={idOf(booking)}>
                    <td className="whitespace-nowrap">
                      {formatDate(booking.startTime)}
                      <span className="ml-1.5 text-xs text-muted-foreground">
                        {formatTime(booking.startTime)}
                      </span>
                    </td>
                    <td>{booking.service?.name ?? "—"}</td>
                    <td className="text-sm text-muted-foreground">
                      {booking.business?.businessName ?? "—"}
                    </td>
                    <td>
                      <StatusBadge status={booking.status} />
                    </td>
                    <td className="text-right font-semibold">
                      {formatCurrency(booking.totalPrice ?? 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data?.hasNextPage && (
            <div className="mt-4 flex justify-center">
              <button
                type="button"
                onClick={() => setPage((prev) => prev + 1)}
                disabled={updateStatus.isPending}
                className="btn-outline btn-sm"
              >
                {updateStatus.isPending ? <Loader2 size={13} className="animate-spin" aria-hidden="true" /> : "Load more"}
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
