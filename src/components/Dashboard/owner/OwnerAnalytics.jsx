"use client";

import { useMemo } from "react";
import Link from "next/link";
import { BarChart3, TrendingUp, Star, Scissors, Info } from "lucide-react";
import { useBookings } from "@/hooks/useBookings";
import { useMyBusiness } from "@/hooks/useBusinesses";
import RevenueChart from "@/components/Dashboard/RevenueChart";
import StatCard from "@/components/Dashboard/StatCard";
import EmptyState from "@/components/Public/EmptyState";
import { formatCurrency, monthlyRevenue } from "@/lib/utils";

/**
 * Owner analytics.
 *
 * The backend's `/admin/analytics` is admin-only and returns a flat total, not a
 * monthly series — so every figure here is derived client-side from the owner's own
 * booking list. Only `attended` bookings count as revenue.
 */
export default function OwnerAnalytics() {
  const { data: businessData } = useMyBusiness();
  const { data, isLoading, error } = useBookings({ page: 1, limit: 500 });

  const business = businessData?.business ?? businessData;
  const bookings = useMemo(() => data?.items ?? [], [data]);

  const completed = bookings.filter((booking) => booking.status === "attended");
  const cancelled = bookings.filter((booking) =>
    ["cancelled", "late_cancel", "no_show"].includes(booking.status)
  );

  const revenue = completed.reduce((sum, booking) => sum + Number(booking.totalPrice ?? 0), 0);
  const averageTicket = completed.length > 0 ? revenue / completed.length : 0;
  const cancellationRate =
    bookings.length > 0 ? Math.round((cancelled.length / bookings.length) * 100) : 0;

  // Which services actually earn, and which staff members are busiest.
  const byService = useMemo(() => {
    const totals = new Map();
    for (const booking of completed) {
      const key = booking.service?.name ?? "Unknown";
      const entry = totals.get(key) ?? { name: key, revenue: 0, count: 0 };
      entry.revenue += Number(booking.totalPrice ?? 0);
      entry.count += 1;
      totals.set(key, entry);
    }
    return [...totals.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 6);
  }, [completed]);

  const byStaff = useMemo(() => {
    const totals = new Map();
    for (const booking of completed) {
      const key = booking.staff?.name ?? "Unassigned";
      totals.set(key, (totals.get(key) ?? 0) + 1);
    }
    return [...totals.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [completed]);

  const trend = useMemo(() => monthlyRevenue(completed, 6), [completed]);
  const hasTrend = trend.some((point) => point.revenue > 0);

  if (error) {
    return <EmptyState icon={BarChart3} title="Could not load analytics" description={error.message} />;
  }

  if (isLoading) {
    return (
      <div className="space-y-6" aria-busy="true">
        <div className="grid gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="skeleton h-28 rounded-2xl" />
          ))}
        </div>
        <div className="skeleton h-80 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl sm:text-3xl">Analytics</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Performance for {business?.businessName ?? "your business"}.
        </p>
      </header>

      {completed.length === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="No completed visits yet"
          description="Analytics fill in once you have marked appointments as attended. Revenue is counted from completed visits only, so cancellations never inflate your totals."
          action={
            <Link href="/dashboard/owner/calendar" className="btn-primary btn-sm">
              Open the calendar
            </Link>
          }
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total revenue" value={formatCurrency(revenue)} icon={TrendingUp} tone="success" />
            <StatCard label="Completed visits" value={completed.length} icon={Star} />
            <StatCard
              label="Average ticket"
              value={formatCurrency(averageTicket)}
              icon={Scissors}
              hint="Per completed visit"
            />
            <StatCard
              label="Cancellation rate"
              value={`${cancellationRate}%`}
              icon={BarChart3}
              tone={cancellationRate > 20 ? "danger" : "default"}
              hint={`${cancelled.length} of ${bookings.length}`}
            />
          </div>

          <RevenueChart bookings={completed} months={6} />

          {hasTrend && (
            <section aria-labelledby="trend-heading">
              <h2 id="trend-heading" className="mb-4 text-lg">
                Monthly revenue
              </h2>
              <div className="table-wrap rounded-2xl bg-surface p-2 shadow-card sm:p-4">
                <table className="table">
                  <thead>
                    <tr>
                      <th scope="col">Month</th>
                      <th scope="col" className="text-right">
                        Revenue
                      </th>
                      <th scope="col" className="w-1/3">
                        Share
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {trend.map((point) => {
                      const peak = Math.max(...trend.map((entry) => entry.revenue), 1);
                      return (
                        <tr key={point.month}>
                          <td className="whitespace-nowrap font-medium">{point.label}</td>
                          <td className="text-right font-semibold tabular-nums">
                            {formatCurrency(point.revenue)}
                          </td>
                          <td>
                            <div
                              className="h-2 rounded-full bg-accent"
                              style={{ width: `${Math.round((point.revenue / peak) * 100)}%` }}
                              role="img"
                              aria-label={`${point.label}: ${formatCurrency(point.revenue)}`}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            <section aria-labelledby="service-revenue">
              <h2 id="service-revenue" className="mb-4 text-lg">
                Top services by revenue
              </h2>
              {byService.length === 0 ? (
                <p className="rounded-xl bg-muted px-4 py-8 text-center text-sm text-muted-foreground">
                  No completed bookings on a named service yet.
                </p>
              ) : (
                <ul className="space-y-2.5">
                  {byService.map((entry, index) => (
                    <li
                      key={entry.name}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 text-sm font-bold text-muted-foreground">{index + 1}</span>
                        <div>
                          <p className="text-sm font-medium">{entry.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {entry.count} {entry.count === 1 ? "visit" : "visits"}
                          </p>
                        </div>
                      </div>
                      <p className="font-semibold text-accent tabular-nums">
                        {formatCurrency(entry.revenue)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section aria-labelledby="staff-volume">
              <h2 id="staff-volume" className="mb-4 text-lg">
                Completed visits by staff member
              </h2>
              {byStaff.length === 0 ? (
                <p className="rounded-xl bg-muted px-4 py-8 text-center text-sm text-muted-foreground">
                  No completed visits yet.
                </p>
              ) : (
                <ul className="space-y-2.5">
                  {byStaff.map((entry) => {
                    const peak = Math.max(...byStaff.map((item) => item.count), 1);
                    return (
                      <li key={entry.name} className="rounded-xl border border-border px-4 py-3">
                        <div className="flex items-center justify-between gap-3 text-sm">
                          <span className="font-medium">{entry.name}</span>
                          <span className="font-semibold tabular-nums">{entry.count}</span>
                        </div>
                        <div className="mt-2 h-1.5 rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-accent"
                            style={{ width: `${Math.round((entry.count / peak) * 100)}%` }}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </div>

          <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
            <Info size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
            These figures are calculated in your browser from your bookings
            {data?.total > bookings.length
              ? ` (the most recent ${bookings.length} of ${data.total})`
              : ""}
            . The admin analytics endpoint is platform-wide and not available to a
            business, so no monthly series is fetched from the API.
          </p>
        </>
      )}
    </div>
  );
}
