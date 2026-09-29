"use client";

import { useState } from "react";
import { CalendarDays, Loader2 } from "lucide-react";
import { useBookings, useUpdateBookingStatus } from "@/hooks/useBookings";
import CalendarBoard from "@/components/Dashboard/BookingsTable";
import EmptyState from "@/components/Public/EmptyState";
import StatusBadge from "@/components/Public/StatusBadge";
import { formatCurrency, formatDate, formatTime, idOf } from "@/lib/utils";
import { BOOKING_STATUSES } from "@/lib/constants";

/**
 * Status transitions an owner is allowed to make.
 *
 * The API accepts any status for the business side, but offering a closed list
 * keeps the UI from proposing nonsensical moves (e.g. "attended" for a booking
 * that has not happened yet).
 */
const NEXT_STATUSES = {
  pending: ["confirmed", "cancelled", "no_show"],
  confirmed: ["attended", "cancelled", "no_show", "late_cancel"],
  late_cancel: ["attended", "cancelled"],
  cancelled: [],
  no_show: [],
  attended: [],
};

function StatusControls({ booking, onChange, isPending }) {
  const options = NEXT_STATUSES[booking.status] ?? [];
  if (options.length === 0) return <span className="text-xs text-muted-foreground">Final</span>;

  return (
    <div className="flex flex-wrap justify-end gap-1.5">
      {options.map((status) => (
        <button
          key={status}
          type="button"
          onClick={() => onChange(booking, status)}
          disabled={isPending}
          className={`btn-outline btn-sm ${
            status === "attended" ? "border-success text-success" : ""
          }`}
        >
          {status.replace(/_/g, " ")}
        </button>
      ))}
    </div>
  );
}

export default function OwnerCalendar() {
  const [status, setStatus] = useState("");
  // The board needs a window of days, so it gets a larger page than the table.
  const { data, isLoading, error } = useBookings({
    page: 1,
    limit: 200,
    status: status || undefined,
  });
  const update = useUpdateBookingStatus();

  const bookings = data?.items ?? [];

  const change = async (booking, next) => {
    await update.mutateAsync({ id: idOf(booking), status: next });
  };

  if (error) {
    return <EmptyState icon={CalendarDays} title="Could not load bookings" description={error.message} />;
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl sm:text-3xl">Calendar</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Confirm, complete and cancel appointments.
        </p>
      </header>

      <CalendarBoard
        bookings={bookings}
        loading={isLoading}
        initialView="week"
        isMutating={update.isPending}
        onStatusChange={change}
      />

      <section aria-labelledby="owner-bookings">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 id="owner-bookings" className="text-lg">
            All bookings
          </h2>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setStatus("")}
              aria-pressed={!status}
              className={`chip ${!status ? "chip-active" : ""}`}
            >
              All
            </button>
            {BOOKING_STATUSES.map((entry) => (
              <button
                key={entry}
                type="button"
                onClick={() => setStatus(entry)}
                aria-pressed={status === entry}
                className={`chip ${status === entry ? "chip-active" : ""}`}
              >
                {entry.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>

        <div className="table-wrap rounded-2xl bg-surface p-2 shadow-card sm:p-4">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">When</th>
                <th scope="col">Customer</th>
                <th scope="col">Service</th>
                <th scope="col">Status</th>
                <th scope="col" className="text-right">
                  Total
                </th>
                <th scope="col" className="text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={idOf(booking)}>
                  <td className="whitespace-nowrap">
                    <p className="font-medium">{formatDate(booking.startTime)}</p>
                    <p className="text-xs text-muted-foreground">{formatTime(booking.startTime)}</p>
                  </td>
                  <td>
                    <p className="text-sm font-medium">{booking.customer?.name ?? "Customer"}</p>
                    {booking.customer?.email && (
                      <p className="text-xs text-muted-foreground">{booking.customer.email}</p>
                    )}
                  </td>
                  <td className="text-sm">
                    <p>{booking.service?.name ?? "—"}</p>
                    {booking.staff?.name && (
                      <p className="text-xs text-muted-foreground">{booking.staff.name}</p>
                    )}
                  </td>
                  <td>
                    <StatusBadge status={booking.status} />
                  </td>
                  <td className="text-right font-semibold tabular-nums">
                    {formatCurrency(booking.totalPrice ?? 0)}
                  </td>
                  <td>
                    <div className="flex justify-end">
                      {isLoading ? (
                        <Loader2 size={14} className="animate-spin text-muted-foreground" />
                      ) : (
                        <StatusControls
                          booking={booking}
                          onChange={change}
                          isPending={update.isPending}
                        />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {bookings.length === 0 && !isLoading && (
          <p className="mt-4 rounded-xl bg-muted px-4 py-8 text-center text-sm text-muted-foreground">
            No bookings match this filter.
          </p>
        )}

        {data && data.total > bookings.length && (
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Showing the {bookings.length} most recent of {data.total} bookings. Narrow the filter to see
            older ones.
          </p>
        )}
      </section>
    </div>
  );
}
