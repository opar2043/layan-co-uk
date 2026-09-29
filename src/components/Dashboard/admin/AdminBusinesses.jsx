"use client";

import { useMemo, useState } from "react";
import { Store, Check, X, MapPin, Loader2, ShieldCheck } from "lucide-react";
import { usePendingBusinesses, useVerifyBusiness, useSearchBusinesses } from "@/hooks/useBusinesses";
import StatusBadge from "@/components/Public/StatusBadge";
import EmptyState from "@/components/Public/EmptyState";
import DataTable from "@/components/Dashboard/DataTable";
import { formatDate, idOf } from "@/lib/utils";
import { VERIFICATION_STATUSES } from "@/lib/constants";

const TABS = [
  { key: "pending", label: "Awaiting review" },
  { key: "all", label: "All businesses" },
];

/** One review card: the owner submitted it, an admin approves or rejects it. */
function ReviewCard({ business, onDecide, isMutating }) {
  const [expanded, setExpanded] = useState(false);
  const location = business.location ?? {};

  return (
    <li className="rounded-2xl bg-surface p-5 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold">{business.businessName}</h3>
          <p className="text-sm text-muted-foreground">
            {business.category}
            {location.city ? ` · ${location.city}` : ""}
          </p>
        </div>
        <StatusBadge status={business.verificationStatus} />
      </div>

      <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs text-muted-foreground">Owner</dt>
          <dd className="font-medium">{business.ownerName}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Contact</dt>
          <dd className="truncate font-medium">{business.email}</dd>
        </div>
        {location.address && (
          <div className="sm:col-span-2">
            <dt className="text-xs text-muted-foreground">Address</dt>
            <dd className="flex items-start gap-1.5 font-medium">
              <MapPin size={13} className="mt-1 shrink-0" aria-hidden="true" />
              {location.address}
            </dd>
          </div>
        )}
        {location.coordinates?.lat != null && location.coordinates?.lng != null && (
          <div>
            <dt className="text-xs text-muted-foreground">Coordinates</dt>
            <dd className="font-medium tabular-nums">
              {location.coordinates.lat}, {location.coordinates.lng}
            </dd>
          </div>
        )}
        <div>
          <dt className="text-xs text-muted-foreground">Registered</dt>
          <dd className="font-medium">{formatDate(business.createdAt)}</dd>
        </div>
      </dl>

      {business.description && (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="text-sm font-medium text-accent hover:underline"
            aria-expanded={expanded}
          >
            {expanded ? "Hide description" : "Read description"}
          </button>
          {expanded && <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{business.description}</p>}
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-4">
        <button
          type="button"
          onClick={() => onDecide(business, "approved")}
          disabled={isMutating}
          className="btn-primary btn-sm"
        >
          {isMutating ? (
            <Loader2 size={13} className="animate-spin" aria-hidden="true" />
          ) : (
            <Check size={13} aria-hidden="true" />
          )}
          Approve
        </button>
        <button
          type="button"
          onClick={() => onDecide(business, "rejected")}
          disabled={isMutating}
          className="btn-outline btn-sm border-danger text-danger"
        >
          <X size={13} aria-hidden="true" />
          Reject
        </button>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        Approving sets `isBusinessVerified` and `isIdentityVerified` together, which is what makes
        the listing appear in public search and lets it accept bookings.
      </p>
    </li>
  );
}

export default function AdminBusinesses() {
  const [tab, setTab] = useState("pending");
  const { data: pendingData, isLoading, error } = usePendingBusinesses();
  // Admins can opt out of the verified-only default with `all=true`.
  const { data: allData, isLoading: isLoadingAll } = useSearchBusinesses({ all: true, page: 1, limit: 100 });
  const verify = useVerifyBusiness();

  const pending = pendingData?.businesses ?? [];
  const all = allData?.items ?? allData?.businesses ?? [];

  const decide = async (business, status) => {
    await verify.mutateAsync({ id: idOf(business), status });
  };

  const columns = useMemo(
    () => [
      { key: "businessName", label: "Business", render: (row) => <span className="font-medium">{row.businessName}</span> },
      { key: "category", label: "Category" },
      { key: "ownerName", label: "Owner" },
      { key: "email", label: "Email" },
      { key: "verificationStatus", label: "Status", render: (row) => <StatusBadge status={row.verificationStatus} /> },
      { key: "createdAt", label: "Registered", render: (row) => formatDate(row.createdAt) },
    ],
    []
  );

  if (error) {
    return <EmptyState icon={Store} title="Could not load businesses" description={error.message} />;
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl sm:text-3xl">Business verification</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Approving a business makes it visible in public search and able to take bookings.
        </p>
      </header>

      <div role="tablist" aria-label="Business views" className="flex gap-1 rounded-xl bg-muted p-1">
        {TABS.map((entry) => (
          <button
            key={entry.key}
            type="button"
            role="tab"
            aria-selected={tab === entry.key}
            onClick={() => setTab(entry.key)}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition ${
              tab === entry.key ? "bg-surface text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {entry.label}
            {entry.key === "pending" && pending.length > 0 && (
              <span className="ml-2 rounded-full bg-accent px-1.5 py-0.5 text-[11px] text-white">
                {pending.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === "pending" ? (
        isLoading ? (
          <div className="space-y-4" aria-busy="true">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="skeleton h-56 w-full rounded-2xl" />
            ))}
          </div>
        ) : pending.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title="Nothing to review"
            description="No business is waiting for verification. New owner sign-ups land here automatically."
          />
        ) : (
          <ul className="space-y-4">
            {pending.map((business) => (
              <ReviewCard
                key={idOf(business)}
                business={business}
                onDecide={decide}
                isMutating={verify.isPending}
              />
            ))}
          </ul>
        )
      ) : isLoadingAll ? (
        <div className="skeleton h-72 w-full rounded-2xl" aria-busy="true" />
      ) : (
        <DataTable
          columns={columns}
          rows={all}
          getRowId={idOf}
          emptyTitle="No businesses registered yet"
          emptyDescription="Owner sign-ups appear here the moment they are submitted."
          emptyIcon={Store}
        />
      )}

      <p className="text-xs leading-relaxed text-muted-foreground">
        Verification statuses: {VERIFICATION_STATUSES.join(", ")}. The &quot;All businesses&quot; tab
        uses the admin-only{" "}
        <code className="rounded bg-muted px-1">?all=true</code> flag, since the public
        endpoint hides unverified listings by design.
      </p>
    </div>
  );
}
