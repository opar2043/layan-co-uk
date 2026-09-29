"use client";

import Link from "next/link";
import {
  CalendarDays, TrendingUp, Users, Star, Clock, AlertTriangle, Store,
} from "lucide-react";
import { useMyBusiness } from "@/hooks/useBusinesses";
import { useBookings } from "@/hooks/useBookings";
import { useStaff } from "@/hooks/useStaff";
import { useWaitlist } from "@/hooks/useWaitlist";
import { useReviews } from "@/hooks/useReviews";
import useAuth from "@/components/Auth/useAuth";
import StatusBadge from "@/components/Public/StatusBadge";
import StatCard from "@/components/Dashboard/StatCard";
import RevenueChart from "@/components/Dashboard/RevenueChart";
import EmptyState from "@/components/Public/EmptyState";
import {
  formatCurrency, formatDate, formatTime, idOf, isFuture,
} from "@/lib/utils";
import { VERIFICATION_STATUSES } from "@/lib/constants";

/** Blocks the whole dashboard until an admin approves the listing. */
function PendingBanner({ status, onRefresh }) {
  return (
    <div className="rounded-2xl border border-warning/30 bg-warning/10 p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex gap-3">
          <AlertTriangle size={20} className="mt-0.5 shrink-0 text-warning" aria-hidden="true" />
          <div>
            <h2 className="text-base font-semibold">
              {status === "rejected" ? "Your listing was not approved" : "Your listing is awaiting review"}
            </h2>
            <p className="mt-1 max-w-prose text-sm leading-relaxed text-muted-foreground">
              {status === "rejected"
                ? "An admin rejected this listing. Update your business details and contact support to have it reviewed again."
                : "You can set up your business while it is being reviewed, but customers cannot find or book you until an admin approves it."}
            </p>
          </div>
        </div>
        <button type="button" onClick={onRefresh} className="btn-outline btn-sm shrink-0">
          Check status
        </button>
      </div>
    </div>
  );
}

function TodayBookings({ bookings, loading }) {
  const today = new Date().toDateString();

  if (loading) {
    return (
      <div className="rounded-2xl bg-surface p-5 shadow-card" aria-busy="true">
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="skeleton h-16 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-surface p-5 shadow-card">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold">Today&apos;s schedule</h2>
        <Link href="/dashboard/owner/calendar" className="text-sm font-medium text-accent hover:underline">
          Full calendar
        </Link>
      </div>

      {bookings.length === 0 ? (
        <p className="rounded-xl bg-muted px-4 py-8 text-center text-sm text-muted-foreground">
          Nothing booked for today. New appointments will appear here automatically.
        </p>
      ) : (
        <ul className="space-y-2">
          {bookings.map((booking) => (
            <li
              key={idOf(booking)}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-border px-4 py-3"
            >
              <span className="w-14 shrink-0 text-sm font-bold tabular-nums">
                {formatTime(booking.startTime)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {booking.service?.name ?? "Appointment"}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {booking.customer?.name ?? "Customer"}
                  {booking.staff?.name ? ` · with ${booking.staff.name}` : ""}
                </p>
              </div>
              <StatusBadge status={booking.status} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function OwnerOverview() {
  const { refresh } = useAuth();
  const { data: businessData, isLoading: businessLoading, refetch, error } = useMyBusiness();
  const { data: bookingData, isLoading: bookingsLoading } = useBookings({ page: 1, limit: 100 });
  const { data: staffData } = useStaff();
  const { data: waitlistData } = useWaitlist({ page: 1, limit: 100 });

  const business = businessData?.business ?? businessData;
  const businessId = business?._id;

  // GET /reviews is not JWT-scoped, so it needs an explicit businessId.
  const { data: reviewData } = useReviews(
    { businessId, page: 1, limit: 100 },
    { enabled: Boolean(businessId) }
  );

  const bookings = bookingData?.items ?? [];
  const staff = staffData?.staff ?? staffData?.items ?? [];
  const waitlist = waitlistData?.items ?? [];
  const reviews = reviewData?.items ?? [];

  const today = new Date().toDateString();
  const todaysBookings = bookings
    .filter((booking) => new Date(booking.startTime).toDateString() === today)
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

  const upcoming = bookings.filter((booking) => isFuture(booking.startTime));
  const pending = bookings.filter((booking) => booking.status === "pending");

  // Revenue only counts money actually in hand from visits that happened.
  const completed = bookings.filter((booking) => booking.status === "attended");
  const totalRevenue = completed.reduce((sum, booking) => sum + Number(booking.totalPrice ?? 0), 0);
  const outstanding = upcoming
    .filter((booking) => ["pending", "confirmed"].includes(booking.status))
    .reduce((sum, booking) => sum + Number(booking.totalPrice ?? 0), 0);

  const averageRating = averageOf(reviews);

  if (error) {
    return <EmptyState icon={Store} title="Could not load your business" description={error.message} />;
  }

  const isPendingApproval =
    business && !business.isBusinessVerified && VERIFICATION_STATUSES.includes(business.verificationStatus);

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl">
            {business?.businessName ?? "Your business"}
          </h1>
          {business && (
            <p className="mt-1.5 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <StatusBadge status={business.verificationStatus} label="Verification" />
              <span>{business.category}</span>
              {business.location?.city && <span>· {business.location.city}</span>}
            </p>
          )}
        </div>
        <Link
          href={`/businesses/${idOf(business)}`}
          className="btn-outline btn-sm"
          target="_blank"
          rel="noopener noreferrer"
        >
          View public page
        </Link>
      </header>

      {isPendingApproval && (
        <PendingBanner
          status={business.verificationStatus}
          onRefresh={() => {
            refetch();
            refresh();
          }}
        />
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Today's bookings"
          value={todaysBookings.length}
          icon={CalendarDays}
          tone="accent"
          href="/dashboard/owner/calendar"
        />
        <StatCard
          label="Pending requests"
          value={pending.length}
          icon={Clock}
          tone={pending.length > 0 ? "warning" : "default"}
          href="/dashboard/owner/calendar"
          hint="Needs your confirmation"
        />
        <StatCard
          label="Revenue (attended)"
          value={formatCurrency(totalRevenue)}
          icon={TrendingUp}
          tone="success"
          href="/dashboard/owner/analytics"
          hint={outstanding > 0 ? `${formatCurrency(outstanding)} booked ahead` : undefined}
        />
        <StatCard
          label="Average rating"
          value={averageRating.count > 0 ? `${averageRating.value} (${averageRating.count})` : "—"}
          icon={Star}
          href="/dashboard/owner/reviews"
        />
      </div>

      <RevenueChart bookings={bookings} months={6} />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <TodayBookings bookings={todaysBookings} loading={bookingsLoading} />

        <aside className="space-y-4">
          <div className="rounded-2xl bg-surface p-5 shadow-card">
            <h2 className="text-base font-semibold">Quick stats</h2>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Users size={14} aria-hidden="true" />
                  Active staff
                </span>
                <span className="font-semibold">
                  {businessLoading ? "…" : staff.filter((member) => member.isActive).length}
                </span>
              </li>
              <li className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Clock size={14} aria-hidden="true" />
                  On waitlist
                </span>
                <span className="font-semibold">
                  {waitlist.filter((entry) => entry.status === "waiting").length}
                </span>
              </li>
              <li className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Star size={14} aria-hidden="true" />
                  Reviews
                </span>
                <span className="font-semibold">{reviews.length}</span>
              </li>
              <li className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <CalendarDays size={14} aria-hidden="true" />
                  Total bookings
                </span>
                <span className="font-semibold">{bookingData?.total ?? 0}</span>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl bg-surface p-5 shadow-card">
            <h2 className="text-base font-semibold">Next appointment</h2>
            {upcoming.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                Nothing booked ahead. Share your booking page to get your first customer.
              </p>
            ) : (
              (() => {
                const next = [...upcoming].sort(
                  (a, b) => new Date(a.startTime) - new Date(b.startTime)
                )[0];
                return (
                  <div className="mt-3">
                    <p className="font-semibold">{next.service?.name ?? "Appointment"}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {formatDate(next.startTime)} at {formatTime(next.startTime)}
                    </p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {next.customer?.name ?? "Customer"}
                    </p>
                    <StatusBadge status={next.status} className="mt-2" />
                  </div>
                );
              })()
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

/**
 * Averages the reviews the owner has been given.
 *
 * Ratings live under `ratings.overall` (the API also stores five sub-scores), so a
 * review without that sub-object is skipped rather than counted as zero.
 */
function averageOf(reviews) {
  const rated = reviews.filter(
    (review) => typeof review.ratings?.overall === "number" && review.ratings.overall > 0
  );
  if (rated.length === 0) return { value: "—", count: 0 };
  const total = rated.reduce((sum, review) => sum + review.ratings.overall, 0);
  return { value: (total / rated.length).toFixed(1), count: rated.length };
}
