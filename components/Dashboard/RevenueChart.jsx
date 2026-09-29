"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/Public/CardSkeleton";

function CustomTooltip({ active, payload, label, valueKey = "value", currency = false }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-surface px-3.5 py-2.5 shadow-card">
      <p className="mb-1 text-xs font-semibold text-primary">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey ?? entry.name} className="text-xs text-muted-foreground">
          {entry.name}:{" "}
          <span className="font-semibold text-primary">
            {currency ? formatCurrency(entry.value) : entry.value}
          </span>
        </p>
      ))}
      {valueKey && null}
    </div>
  );
}

const AXIS = {
  stroke: "#6B6459",
  fontSize: 11,
  tickLine: false,
  axisLine: false,
};

/**
 * Revenue / volume trend over the last six months.
 *
 * The series is derived client-side from the booking list the caller already has —
 * the backend's admin analytics returns a flat revenue total, not a monthly
 * breakdown, so there is nothing server-side to plot. See README "Known gaps".
 */
export default function RevenueChart({ data = [], loading = false, currency = true, height = 280 }) {
  if (loading) return <Skeleton className="w-full" style={{ height }} />;

  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-2xl border border-dashed border-border bg-surface/50 text-sm text-muted-foreground"
        style={{ height }}
      >
        No data to chart yet
      </div>
    );
  }

  const hasRevenue = data.some((entry) => (entry.revenue ?? 0) > 0);

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        {hasRevenue ? (
          <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E6DFD3" vertical={false} />
            <XAxis dataKey="month" {...AXIS} />
            <YAxis
              {...AXIS}
              tickFormatter={(value) => (currency ? `£${value}` : value)}
              width={58}
            />
            <Tooltip
              content={<CustomTooltip currency={currency} />}
              cursor={{ fill: "rgba(139, 94, 60, 0.08)" }}
            />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
            <Bar dataKey="revenue" name="Revenue" fill="#8B5E3C" radius={[6, 6, 0, 0]} maxBarSize={48} />
            <Bar
              dataKey="bookings"
              name="Bookings"
              fill="#F3E7DA"
              radius={[6, 6, 0, 0]}
              maxBarSize={48}
            />
          </BarChart>
        ) : (
          <LineChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E6DFD3" vertical={false} />
            <XAxis dataKey="month" {...AXIS} />
            <YAxis {...AXIS} allowDecimals={false} width={40} />
            <Tooltip content={<CustomTooltip currency={false} />} />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
            <Line
              type="monotone"
              dataKey="bookings"
              name="Bookings"
              stroke="#8B5E3C"
              strokeWidth={2.5}
              dot={{ r: 3, fill: "#8B5E3C" }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

/** Compact horizontal bar list for status breakdowns. */
export function BreakdownBars({ data = [], loading = false, currency = false }) {
  if (loading) return <Skeleton className="h-40 w-full" />;
  if (data.length === 0) {
    return <p className="py-6 text-center text-sm text-muted-foreground">No data yet</p>;
  }

  const max = Math.max(...data.map((entry) => entry.value), 1);

  return (
    <ul className="space-y-3">
      {data.map((entry) => (
        <li key={entry.label}>
          <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              {entry.color && (
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} aria-hidden="true" />
              )}
              {entry.label}
            </span>
            <span className="font-semibold tabular-nums">
              {currency ? formatCurrency(entry.value) : entry.value}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-accent transition-all duration-500"
              style={{ width: `${Math.max((entry.value / max) * 100, entry.value > 0 ? 4 : 0)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
