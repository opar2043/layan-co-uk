"use client";

import { useState } from "react";
import { Clock, Check, Bell, XCircle, CalendarCheck } from "lucide-react";
import { useWaitlist, useUpdateWaitlist } from "@/hooks/useWaitlist";
import StatusBadge from "@/components/Public/StatusBadge";
import EmptyState from "@/components/Public/EmptyState";
import { formatDate, formatTime, idOf, isFuture } from "@/lib/utils";
import { WAITLIST_STATUSES } from "@/lib/constants";

/** Statuses the owner may set, per the API's transition rules. */
const NEXT_STATUSES = {
  waiting: ["notified", "booked", "expired"],
  notified: ["booked", "expired"],
  booked: [],
  expired: [],
};

/** Renders the customer's offered dates compactly: "12 Mar 09:00, 13 Mar 11:00". */
function describeDates(dates) {
  if (dates.length === 0) return "Any time";
  const shown = dates.slice(0, 3).map((date) => `${formatDate(date)} ${formatTime(date)}`);
  return dates.length > 3 ? `${shown.join(", ")} +${dates.length - 3} more` : shown.join(", ");
}

export default function OwnerWaitlist() {
  const [status, setStatus] = useState("waiting");
  const { data, isLoading, error } = useWaitlist({ page: 1, limit: 100, status: status || undefined });
  const update = useUpdateWaitlist();

  const entries = data?.items ?? [];

  if (error) {
    return <EmptyState icon={Clock} title="Could not load the waitlist" description={error.message} />;
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl sm:text-3xl">Waitlist</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Customers waiting for a slot. Notify them when one opens up.
        </p>
      </header>

      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setStatus("")}
          aria-pressed={!status}
          className={`chip ${!status ? "chip-active" : ""}`}
        >
          All
        </button>
        {WAITLIST_STATUSES.map((entry) => (
          <button
            key={entry}
            type="button"
            onClick={() => setStatus(entry)}
            aria-pressed={status === entry}
            className={`chip ${status === entry ? "chip-active" : ""}`}
          >
            {entry}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3" aria-busy="true">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="skeleton h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <EmptyState
          icon={Clock}
          title={status ? `No ${status} entries` : "Nobody is waiting"}
          description="When a customer cannot find a suitable slot, they can join your waitlist from your public page and will appear here."
        />
      ) : (
        <ul className="space-y-3">
          {entries.map((entry) => {
            const options = NEXT_STATUSES[entry.status] ?? [];
            const dates = Array.isArray(entry.preferredDates) ? entry.preferredDates : [];
            return (
              <li key={idOf(entry)} className="rounded-2xl bg-surface p-5 shadow-card">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-semibold">{entry.customer?.name ?? "Customer"}</h3>
                    {entry.customer?.email && (
                      <p className="text-sm text-muted-foreground">{entry.customer.email}</p>
                    )}
                    {entry.customer?.phone && (
                      <p className="text-sm text-muted-foreground">{entry.customer.phone}</p>
                    )}
                  </div>
                  <StatusBadge status={entry.status} />
                </div>

                <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1.5 text-sm">
                  <div>
                    <dt className="inline text-muted-foreground">Wants: </dt>
                    <dd className="inline font-medium">
                      {entry.service?.name ?? "Any service"}
                    </dd>
                  </div>
                  {/* `preferredDates` holds every datetime the customer could attend. */}
                  <div>
                    <dt className="inline text-muted-foreground">
                      {dates.length === 1 ? "Available: " : "Available: "}
                    </dt>
                    <dd className="inline font-medium">{describeDates(dates)}</dd>
                  </div>
                  {entry.preferredStaff && (
                    <div>
                      <dt className="inline text-muted-foreground">With: </dt>
                      <dd className="inline font-medium">{entry.preferredStaff.name}</dd>
                    </div>
                  )}
                  {entry.isInstantSlotDiscount && (
                    <div>
                      <dt className="inline text-muted-foreground">Offer: </dt>
                      <dd className="inline font-medium text-accent">Discounted last-minute slot</dd>
                    </div>
                  )}
                </dl>

                <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-3.5">
                  {options.map((next) => (
                    <button
                      key={next}
                      type="button"
                      onClick={() => update.mutate({ id: idOf(entry), status: next })}
                      disabled={update.isPending}
                      className={`btn-outline btn-sm ${
                        next === "notified" ? "border-accent text-accent" : ""
                      }`}
                    >
                      {next === "notified" ? (
                        <Bell size={13} aria-hidden="true" />
                      ) : next === "booked" ? (
                        <CalendarCheck size={13} aria-hidden="true" />
                      ) : null}
                      {next === "notified" ? "Notify" : next === "booked" ? "Mark booked" : "Expire"}
                    </button>
                  ))}

                  {entry.status === "waiting" && (
                    <button
                      type="button"
                      onClick={() => {
                        // `DELETE /waitlist/:id` is customer-only (Firebase), so an owner
                        // retires an entry by marking it expired instead.
                        if (window.confirm(`Mark ${entry.customer?.name ?? "this customer"} as expired?`)) {
                          update.mutate({ id: idOf(entry), status: "expired" });
                        }
                      }}
                      disabled={update.isPending}
                      className="btn-ghost btn-sm text-danger"
                    >
                      <XCircle size={13} aria-hidden="true" />
                      Expire
                    </button>
                  )}

                  {options.length === 0 && entry.status === "booked" && (
                    <p className="flex items-center gap-1.5 text-xs text-success">
                      <Check size={13} aria-hidden="true" />
                      Turned into a booking
                    </p>
                  )}
                </div>

                {entry.status === "waiting" && dates.some(isFuture) && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Still waiting for a slot from {formatDate(dates.find(isFuture))}.
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
