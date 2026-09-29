"use client";

import Link from "next/link";
import {
  Store, Users, CalendarDays, TrendingUp, ShieldAlert, Tag, XCircle, Info,
} from "lucide-react";
import { useAdminAnalytics, useFraudFlags, useDisputes } from "@/hooks/useAdmin";
import { usePendingBusinesses } from "@/hooks/useBusinesses";
import StatCard from "@/components/Dashboard/StatCard";
import StatusBadge from "@/components/Public/StatusBadge";
import EmptyState from "@/components/Public/EmptyState";
import { formatCurrency, formatDate, idOf } from "@/lib/utils";
import { BOOKING_STATUSES, DISPUTE_STATUSES } from "@/lib/constants";

/** Horizontal share-of-total bar. */
function BreakdownBar({ label, value, total, tone = "bg-accent" }) {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <li className="py-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="text-muted-foreground">{label.replace(/_/g, " ")}</span>
        <span className="font-semibold tabular-nums">
          {value} <span className="font-normal text-muted-foreground">({percent}%)</span>
        </span>
      </div>
      <div className="mt-1.5 h-1.5 rounded-full bg-muted">
        <div className={`h-full rounded-full ${tone}`} style={{ width: `${percent}%` }} />
      </div>
    </li>
  );
}

export default function AdminOverview() {
  const { data, isLoading, error } = useAdminAnalytics();
  const { data: fraudData } = useFraudFlags();
  const { data: disputeData } = useDisputes({ status: "open", page: 1, limit: 100 });
  const { data: pendingData } = usePendingBusinesses();

  const businesses = data?.businesses;
  const bookings = data?.bookings;
  const revenue = data?.revenue;
  const customers = data?.customers;

  const pendingBusinesses = pendingData?.items ?? pendingData?.businesses ?? [];
  const openDisputes = disputeData?.items ?? [];
  const flagged = fraudData?.flagged ?? [];

  if (error) {
    return <EmptyState icon={ShieldAlert} title="Could not load platform analytics" description={error.message} />;
  }

  const isEmpty =
    (businesses?.total ?? 0) === 0 && (bookings?.total ?? 0) === 0 && (customers?.total ?? 0) === 0;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl sm:text-3xl">Platform overview</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Everything happening across Layan.
        </p>
      </header>

      {isLoading ? (
        <div className="space-y-6" aria-busy="true">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="skeleton h-28 rounded-2xl" />
            ))}
          </div>
          <div className="skeleton h-64 w-full rounded-2xl" />
        </div>
      ) : isEmpty ? (
        <EmptyState
          icon={Store}
          title="The platform is empty"
          description="Once businesses register and customers start booking, these figures will fill in. This view reads live aggregates from MongoDB — nothing here is stored separately."
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Businesses"
              value={businesses?.total ?? 0}
              icon={Store}
              tone="accent"
              href="/dashboard/admin/businesses"
              hint={`${businesses?.verified ?? 0} verified`}
            />
            <StatCard
              label="Customers"
              value={customers?.total ?? 0}
              icon={Users}
              href="/dashboard/admin/users"
            />
            <StatCard
              label="Bookings"
              value={bookings?.total ?? 0}
              icon={CalendarDays}
              hint={`${bookings?.cancellationRatePercent ?? 0}% failed`}
            />
            <StatCard
              label="GMV (collected)"
              value={formatCurrency(revenue?.gmv ?? 0)}
              icon={TrendingUp}
              tone="success"
              hint={`${formatCurrency(revenue?.tips ?? 0)} tips`}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <section className="rounded-2xl bg-surface p-5 shadow-card" aria-labelledby="booking-status">
              <h2 id="booking-status" className="text-base font-semibold">
                Bookings by status
              </h2>
              <ul className="mt-3">
                {BOOKING_STATUSES.map((status) => (
                  <BreakdownBar
                    key={status}
                    label={status}
                    value={bookings?.byStatus?.[status] ?? 0}
                    total={bookings?.total ?? 0}
                    tone={["cancelled", "late_cancel", "no_show"].includes(status) ? "bg-danger" : "bg-accent"}
                  />
                ))}
              </ul>
            </section>

            <section className="rounded-2xl bg-surface p-5 shadow-card" aria-labelledby="business-status">
              <h2 id="business-status" className="text-base font-semibold">
                Business verification
              </h2>
              <ul className="mt-3">
                <BreakdownBar
                  label="approved"
                  value={businesses?.approved ?? 0}
                  total={businesses?.total ?? 0}
                  tone="bg-success"
                />
                <BreakdownBar
                  label="pending"
                  value={businesses?.pending ?? 0}
                  total={businesses?.total ?? 0}
                  tone="bg-warning"
                />
                <BreakdownBar
                  label="rejected"
                  value={businesses?.rejected ?? 0}
                  total={businesses?.total ?? 0}
                  tone="bg-danger"
                />
              </ul>
              <p className="mt-4 border-t border-border pt-3 text-xs text-muted-foreground">
                {businesses?.verified ?? 0} of {businesses?.total ?? 0} are visible in public search.
              </p>
            </section>

            <section className="rounded-2xl bg-surface p-5 shadow-card" aria-labelledby="revenue-breakdown">
              <h2 id="revenue-breakdown" className="text-base font-semibold">
                Money
              </h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-muted-foreground">GMV collected</dt>
                  <dd className="text-lg font-bold text-accent tabular-nums">
                    {formatCurrency(revenue?.gmv ?? 0)}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-muted-foreground">Amount paid</dt>
                  <dd className="font-semibold tabular-nums">{formatCurrency(revenue?.amountPaid ?? 0)}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-muted-foreground">Tips</dt>
                  <dd className="font-semibold tabular-nums">{formatCurrency(revenue?.tips ?? 0)}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-muted-foreground">Deposits held</dt>
                  <dd className="font-semibold tabular-nums">
                    {formatCurrency(revenue?.depositsHeld ?? 0)}
                  </dd>
                </div>
              </dl>
              <p className="mt-4 border-t border-border pt-3 text-xs leading-relaxed text-muted-foreground">
                GMV sums `amountPaid` on attended bookings only, so it reflects money actually
                collected rather than orders placed.
              </p>
            </section>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-2xl bg-surface p-5 shadow-card" aria-labelledby="needs-action">
              <h2 id="needs-action" className="text-base font-semibold">
                Needs your attention
              </h2>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li className="flex items-center justify-between gap-3 rounded-xl border border-border px-4 py-3">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Store size={14} aria-hidden="true" />
                    Businesses awaiting review
                  </span>
                  <Link
                    href="/dashboard/admin/businesses"
                    className="font-semibold text-accent hover:underline"
                  >
                    {pendingBusinesses.length}
                  </Link>
                </li>
                <li className="flex items-center justify-between gap-3 rounded-xl border border-border px-4 py-3">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <ShieldAlert size={14} aria-hidden="true" />
                    Open disputes
                  </span>
                  <Link
                    href="/dashboard/admin/disputes"
                    className="font-semibold text-accent hover:underline"
                  >
                    {openDisputes.length}
                  </Link>
                </li>
                <li className="flex items-center justify-between gap-3 rounded-xl border border-border px-4 py-3">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <XCircle size={14} aria-hidden="true" />
                    Fraud flags
                  </span>
                  <Link
                    href="/dashboard/admin/fraud"
                    className="font-semibold text-accent hover:underline"
                  >
                    {flagged.length}
                  </Link>
                </li>
                <li className="flex items-center justify-between gap-3 rounded-xl border border-border px-4 py-3">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Tag size={14} aria-hidden="true" />
                    No-shows
                  </span>
                  <span className="font-semibold">{bookings?.noShowCount ?? 0}</span>
                </li>
              </ul>
            </section>

            <section className="rounded-2xl bg-surface p-5 shadow-card" aria-labelledby="recent-disputes">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 id="recent-disputes" className="text-base font-semibold">
                  Recent open disputes
                </h2>
                <Link href="/dashboard/admin/disputes" className="text-sm font-medium text-accent hover:underline">
                  View all
                </Link>
              </div>

              {openDisputes.length === 0 ? (
                <p className="rounded-xl bg-muted px-4 py-8 text-center text-sm text-muted-foreground">
                  Nothing open. Good.
                </p>
              ) : (
                <ul className="space-y-2.5">
                  {openDisputes.slice(0, 5).map((dispute) => (
                    <li key={idOf(dispute)} className="rounded-xl border border-border px-4 py-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-medium">
                          {dispute.customer?.name ?? "Customer"} vs{" "}
                          {dispute.business?.businessName ?? "Business"}
                        </p>
                        <StatusBadge status={dispute.status} />
                      </div>
                      <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                        {dispute.reason}
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        Raised {formatDate(dispute.createdAt)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
            <Info size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
            This endpoint returns a flat total per metric — the API has no monthly revenue series — so
            there is no trend chart here. {DISPUTE_STATUSES.length} dispute statuses and{" "}
            {BOOKING_STATUSES.length} booking statuses are tracked server-side.
          </p>
        </>
      )}
    </div>
  );
}
