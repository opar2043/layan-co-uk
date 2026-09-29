"use client";

import { useState } from "react";
import { Scale, Loader2, ChevronDown } from "lucide-react";
import { useDisputes, useUpdateDispute } from "@/hooks/useAdmin";
import StatusBadge from "@/components/Public/StatusBadge";
import EmptyState from "@/components/Public/EmptyState";
import Pagination from "@/components/Public/Pagination";
import { formatDate, idOf, titleCase } from "@/lib/utils";
import { DISPUTE_STATUSES } from "@/lib/constants";

const PER_PAGE = 10;

/** Closing a dispute requires a written note, which the API enforces. */
const CLOSING = { resolved: "Resolution", rejected: "Rejection reason" };

/**
 * Decision form.
 *
 * `resolutionNote` is mandatory for resolved/rejected, so the field is only
 * rendered once a closing status is picked and submission is blocked until it
 * has content.
 */
function DecisionForm({ dispute, onSubmit, isPending }) {
  const [status, setStatus] = useState(dispute.status);
  const [note, setNote] = useState(dispute.resolutionNote ?? "");

  const label = CLOSING[status];
  const isClosing = Boolean(label);
  const canSubmit = !isClosing || note.trim().length > 0;
  const isUnchanged = status === dispute.status && note.trim() === (dispute.resolutionNote ?? "").trim();

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (!canSubmit || isUnchanged) return;
        onSubmit(status, note.trim() || undefined);
      }}
      className="space-y-3 border-t border-border pt-4"
    >
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-40 flex-1">
          <label htmlFor={`dispute-status-${idOf(dispute)}`} className="label">
            Set status
          </label>
          <select
            id={`dispute-status-${idOf(dispute)}`}
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="input py-2 text-sm"
          >
            {DISPUTE_STATUSES.map((entry) => (
              <option key={entry} value={entry}>
                {titleCase(entry)}
              </option>
            ))}
          </select>
        </div>

        {isClosing && (
          <div className="min-w-0 flex-[2]">
            <label htmlFor={`dispute-note-${idOf(dispute)}`} className="label">
              {label} <span className="text-danger">*</span>
            </label>
            <textarea
              id={`dispute-note-${idOf(dispute)}`}
              rows={2}
              maxLength={4000}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Explain the decision — both parties can read this."
              className="input py-2 text-sm"
              required
            />
          </div>
        )}

        <button
          type="submit"
          disabled={!canSubmit || isUnchanged || isPending}
          className="btn-primary btn-sm shrink-0"
        >
          {isPending && <Loader2 size={13} className="animate-spin" aria-hidden="true" />}
          Save
        </button>
      </div>

      {isClosing && !canSubmit && (
        <p className="text-xs text-danger">
          A {status} dispute needs a {label.toLowerCase()}.
        </p>
      )}
    </form>
  );
}

function DisputeCard({ dispute, onDecide, isPending }) {
  const [open, setOpen] = useState(false);
  const bookingId = typeof dispute.bookingId === "object" ? dispute.bookingId?._id : dispute.bookingId;

  return (
    <li className="rounded-2xl bg-surface p-5 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base font-semibold">
            {dispute.customer?.name ?? "Customer"} vs {dispute.business?.businessName ?? "Business"}
          </h3>
          <p className="text-xs text-muted-foreground">
            Raised {formatDate(dispute.createdAt)}
            {dispute.business?.category ? ` · ${dispute.business.category}` : ""}
          </p>
        </div>
        <StatusBadge status={dispute.status} />
      </div>

      <div className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
        <div>
          <p className="text-xs text-muted-foreground">Customer</p>
          <p className="truncate font-medium">{dispute.customer?.email ?? "—"}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Business</p>
          <p className="truncate font-medium">{dispute.business?.businessName ?? "—"}</p>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-xs text-muted-foreground">Reason</p>
        <p className="mt-0.5 text-sm leading-relaxed">{dispute.reason}</p>
      </div>

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="mt-3 flex items-center gap-1.5 text-sm font-medium text-accent hover:underline"
      >
        {open ? "Hide" : "Show"} evidence & actions
        <ChevronDown
          size={14}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div className="mt-3 space-y-4">
          {dispute.customerEvidence && (
            <div className="rounded-xl bg-muted/60 p-3">
              <p className="text-xs font-semibold text-muted-foreground">Customer evidence</p>
              <p className="mt-1 text-sm leading-relaxed">{dispute.customerEvidence}</p>
            </div>
          )}
          {dispute.businessEvidence && (
            <div className="rounded-xl bg-muted/60 p-3">
              <p className="text-xs font-semibold text-muted-foreground">Business evidence</p>
              <p className="mt-1 text-sm leading-relaxed">{dispute.businessEvidence}</p>
            </div>
          )}
          {!dispute.customerEvidence && !dispute.businessEvidence && (
            <p className="text-sm text-muted-foreground">No evidence was attached.</p>
          )}

          {dispute.resolutionNote && (
            <div className="rounded-xl border border-success/30 bg-success/5 p-3">
              <p className="text-xs font-semibold text-success">Decision note</p>
              <p className="mt-1 text-sm leading-relaxed">{dispute.resolutionNote}</p>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Booking <code className="rounded bg-muted px-1">{bookingId ?? "unknown"}</code>
          </p>

          <DecisionForm dispute={dispute} onSubmit={onDecide} isPending={isPending} />
        </div>
      )}
    </li>
  );
}

export default function AdminDisputes() {
  const [status, setStatus] = useState("open");
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useDisputes({ status, page, limit: PER_PAGE });
  const update = useUpdateDispute();

  const disputes = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  const decide = async (dispute, nextStatus, resolutionNote) => {
    await update.mutateAsync({ id: idOf(dispute), status: nextStatus, resolutionNote });
  };

  const onFilterChange = (value) => {
    setStatus(value);
    setPage(1);
  };

  if (error) {
    return <EmptyState icon={Scale} title="Could not load disputes" description={error.message} />;
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl sm:text-3xl">Disputes</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Customers and businesses both raise disputes. Closing one requires a written note.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">Show</span>
        {["all", ...DISPUTE_STATUSES].map((entry) => (
          <button
            key={entry}
            type="button"
            onClick={() => onFilterChange(entry)}
            aria-pressed={status === entry}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
              status === entry
                ? "bg-accent text-white"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {titleCase(entry)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4" aria-busy="true">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="skeleton h-44 w-full rounded-2xl" />
          ))}
        </div>
      ) : disputes.length === 0 ? (
        <EmptyState
          icon={Scale}
          title={status === "all" ? "No disputes raised" : `No ${status.replace(/_/g, " ")} disputes`}
          description="Disputes filed from a booking appear here for review."
        />
      ) : (
        <ul className="space-y-4">
          {disputes.map((dispute) => (
            <DisputeCard
              key={idOf(dispute)}
              dispute={dispute}
              onDecide={(nextStatus, note) => decide(dispute, nextStatus, note)}
              isPending={update.isPending}
            />
          ))}
        </ul>
      )}

      {totalPages > 1 && (
        <Pagination page={page} totalPages={totalPages} total={total} onChange={setPage} />
      )}
    </div>
  );
}
