"use client";

import { ShieldAlert, Mail, Phone, TriangleAlert } from "lucide-react";
import { useFraudFlags } from "@/hooks/useAdmin";
import EmptyState from "@/components/Public/EmptyState";
import { formatDate } from "@/lib/utils";

/** `incidentsByStatus` is a per-status tally, e.g. { cancelled: 2, no_show: 1 }. */
function IncidentTally({ tally }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {Object.entries(tally).map(([status, count]) => (
        <li
          key={status}
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            status === "no_show" ? "bg-danger-light text-danger" : "bg-muted text-muted-foreground"
          }`}
        >
          {count} {status.replace(/_/g, " ")}
        </li>
      ))}
    </ul>
  );
}

export default function AdminFraud() {
  const { data, isLoading, error } = useFraudFlags();

  const flagged = data?.flagged ?? [];
  const threshold = data?.threshold ?? 0;

  if (error) {
    return <EmptyState icon={ShieldAlert} title="Could not load fraud flags" description={error.message} />;
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl sm:text-3xl">Fraud flags</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Customers with {threshold} or more failed bookings (cancelled, late cancel, no-show).
        </p>
      </header>

      <p className="flex items-start gap-2 rounded-xl bg-muted px-4 py-3 text-xs leading-relaxed text-muted-foreground">
        <TriangleAlert size={14} className="mt-0.5 shrink-0 text-warning" aria-hidden="true" />
        This list is informational only. A flag is not a ban — review the incident history and decide
        case by case. The threshold is fixed at {threshold} server-side and cannot be tuned from here.
      </p>

      {isLoading ? (
        <div className="space-y-3" aria-busy="true">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="skeleton h-28 w-full rounded-2xl" />
          ))}
        </div>
      ) : flagged.length === 0 ? (
        <EmptyState
          icon={ShieldAlert}
          title="No customers flagged"
          description={`Nobody has reached ${threshold} failed bookings. Incidents are counted from booking history.`}
        />
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {flagged.length} {flagged.length === 1 ? "customer is" : "customers are"} over the threshold.
          </p>

          <ul className="space-y-3">
            {flagged.map((entry) => (
              <li key={entry.customerId} className="rounded-2xl bg-surface p-5 shadow-card">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-base font-semibold">
                      {entry.customer?.name ?? "Unregistered customer"}
                    </h2>
                    <div className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                      {entry.customer?.email && (
                        <p className="flex items-center gap-1.5">
                          <Mail size={12} aria-hidden="true" />
                          {entry.customer.email}
                        </p>
                      )}
                      {entry.customer?.phone && (
                        <p className="flex items-center gap-1.5">
                          <Phone size={12} aria-hidden="true" />
                          {entry.customer.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl bg-danger-light px-3 py-2 text-center">
                    <p className="text-lg font-bold text-danger tabular-nums">{entry.incidentCount}</p>
                    <p className="text-[11px] text-danger/80">incidents</p>
                  </div>
                </div>

                <div className="mt-4 border-t border-border pt-3">
                  <IncidentTally tally={entry.incidentsByStatus ?? {}} />
                </div>

                <p className="mt-3 text-xs text-muted-foreground">
                  Most recent incident {formatDate(entry.lastIncidentAt)}
                </p>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
