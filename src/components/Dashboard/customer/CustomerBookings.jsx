"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, Search } from "lucide-react";
import { useBookings, useUpdateBookingStatus } from "@/hooks/useBookings";
import StatusBadge from "@/components/Public/StatusBadge";
import EmptyState from "@/components/Public/EmptyState";
import Pagination from "@/components/Public/Pagination";
import DataTable from "@/components/Dashboard/DataTable";
import { UpcomingBookingCard } from "@/components/Dashboard/customer/CustomerOverview";
import ReviewForm from "@/components/Dashboard/customer/ReviewForm";
import {
  durationMinutes,
  formatCurrency,
  formatDate,
  formatTime,
  idOf,
  isFuture,
} from "@/lib/utils";
import { BOOKING_STATUSES } from "@/lib/constants";

/** Full booking history with status filtering, in-table search and server pagination. */
export default function CustomerBookings() {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [reviewing, setReviewing] = useState(null);

  const { data, isLoading, error } = useBookings({
    page,
    limit: 10,
    status: status || undefined,
  });
  const updateStatus = useUpdateBookingStatus();

  const bookings = useMemo(() => data?.items ?? [], [data]);

  const upcoming = useMemo(
    () =>
      bookings.filter(
        (booking) =>
          ["pending", "confirmed"].includes(booking.status) && isFuture(booking.startTime)
      ),
    [bookings]
  );

  const columns = useMemo(
    () => [
      {
        key: "startTime",
        header: "When",
        sortable: true,
        render: (booking) => (
          <div className="whitespace-nowrap">
            <p className="font-medium">{formatDate(booking.startTime)}</p>
            <p className="text-xs text-muted-foreground">
              {formatTime(booking.startTime)} · {durationMinutes(booking.startTime, booking.endTime)} min
            </p>
          </div>
        ),
      },
      {
        key: "service",
        header: "Service",
        sortable: true,
        sortAccessor: (booking) => booking.service?.name ?? "",
        render: (booking) => (
          <div>
            <p className="font-medium">{booking.service?.name ?? "—"}</p>
            {booking.staff?.name && (
              <p className="text-xs text-muted-foreground">with {booking.staff.name}</p>
            )}
          </div>
        ),
      },
      {
        key: "business",
        header: "Business",
        render: (booking) => {
          const businessId = idOf(booking.business);
          return businessId ? (
            <Link
              href={`/businesses/${businessId}`}
              className="text-sm font-medium text-accent hover:underline"
            >
              {booking.business?.businessName ?? "View"}
            </Link>
          ) : (
            <span className="text-sm text-muted-foreground">—</span>
          );
        },
      },
      {
        key: "status",
        header: "Status",
        sortable: true,
        render: (booking) => <StatusBadge status={booking.status} />,
      },
      {
        key: "totalPrice",
        header: "Total",
        sortable: true,
        className: "text-right",
        render: (booking) => (
          <div className="text-right">
            <p className="font-semibold">{formatCurrency(booking.totalPrice ?? 0)}</p>
            {Number(booking.amountPaid ?? 0) > 0 && (
              <p className="text-xs text-muted-foreground">
                {formatCurrency(booking.amountPaid ?? 0)} paid
              </p>
            )}
          </div>
        ),
      },
      {
        key: "actions",
        header: "",
        className: "text-right",
        render: (booking) => (
          <div className="flex justify-end gap-1.5">
            {/* `isVerifiedReviewEligible` is the flag the API actually checks, and it is
                set when the appointment is marked attended. The API allows exactly one
                review per booking, so a duplicate surfaces as a 409 toast. */}
            {booking.isVerifiedReviewEligible && (
              <button
                type="button"
                onClick={() => setReviewing(booking)}
                className="btn-ghost btn-sm text-accent"
              >
                Review
              </button>
            )}
            {["pending", "confirmed"].includes(booking.status) && isFuture(booking.startTime) && (
              <button
                type="button"
                onClick={() =>
                  updateStatus.mutate({ id: idOf(booking), status: "cancelled" })
                }
                disabled={updateStatus.isPending}
                className="btn-ghost btn-sm text-danger"
              >
                Cancel
              </button>
            )}
          </div>
        ),
      },
    ],
    [updateStatus]
  );

  if (error) {
    return <EmptyState icon={CalendarDays} title="Could not load bookings" description={error.message} />;
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl sm:text-3xl">My bookings</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Every appointment you have made, current and past.
        </p>
      </header>

      {upcoming.length > 0 && !isLoading && (
        <section aria-labelledby="next-up">
          <h2 id="next-up" className="mb-4 text-lg">
            Next appointments
          </h2>
          <div className="space-y-3">
            {upcoming.map((booking) => (
              <UpcomingBookingCard
                key={idOf(booking)}
                booking={booking}
                onCancel={(item) =>
                  updateStatus.mutate({ id: idOf(item), status: "cancelled" })
                }
                isCancelling={updateStatus.isPending}
              />
            ))}
          </div>
        </section>
      )}

      <section aria-labelledby="all-bookings">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 id="all-bookings" className="text-lg">
            All bookings
          </h2>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => {
                setStatus("");
                setPage(1);
              }}
              aria-pressed={!status}
              className={`chip ${!status ? "chip-active" : ""}`}
            >
              All
            </button>
            {BOOKING_STATUSES.map((entry) => (
              <button
                key={entry}
                type="button"
                onClick={() => {
                  setStatus(entry);
                  setPage(1);
                }}
                aria-pressed={status === entry}
                className={`chip ${status === entry ? "chip-active" : ""}`}
              >
                {entry.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>

        <DataTable
          columns={columns}
          rows={bookings}
          getRowId={(booking) => idOf(booking)}
          loading={isLoading}
          searchKeys={[
            (booking) => booking.service?.name,
            (booking) => booking.business?.businessName,
          ]}
          emptyTitle="No bookings yet"
          emptyDescription="Once you book an appointment it will appear here."
          emptyIcon={CalendarDays}
          emptyAction={
            <Link href="/search" className="btn-primary btn-sm">
              Find a salon
            </Link>
          }
        />

        {data?.totalPages > 1 && (
          <Pagination
            className="mt-6"
            page={data.page}
            totalPages={data.totalPages}
            total={data.total}
            onChange={setPage}
          />
        )}
      </section>

      {reviewing && <ReviewForm booking={reviewing} onClose={() => setReviewing(null)} />}
    </div>
  );
}
