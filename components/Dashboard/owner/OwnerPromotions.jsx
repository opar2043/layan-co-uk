"use client";

import { useEffect, useState } from "react";
import { Tag, Plus, Pencil, Trash2, Loader2, X } from "lucide-react";
import {
  usePromotions, useCreatePromotion, useUpdatePromotion, useDeactivatePromotion,
} from "@/hooks/usePromotions";
import StatusBadge from "@/components/Public/StatusBadge";
import EmptyState from "@/components/Public/EmptyState";
import { formatCurrency, toDateInput, titleCase } from "@/lib/utils";
import { PROMOTION_TYPES } from "@/lib/constants";

/** Default window: a fortnight starting today. */
function defaultWindow() {
  const start = new Date();
  const end = new Date();
  end.setDate(end.getDate() + 14);
  return { startDate: toDateInput(start), endDate: toDateInput(end) };
}

const BLANK = {
  title: "",
  type: PROMOTION_TYPES[0],
  // `useAmount` is an explicit mode rather than being inferred from which field is
  // filled in — otherwise typing an amount while the percent default (10) is still
  // present would submit BOTH discount fields.
  useAmount: false,
  discountPercent: 10,
  discountAmount: "",
  ...defaultWindow(),
};

function PromotionForm({ editing, onClose }) {
  const create = useCreatePromotion();
  const update = useUpdatePromotion();
  const [draft, setDraft] = useState(editing ? toFormValues(editing) : { ...BLANK });

  useEffect(() => {
    setDraft(editing ? toFormValues(editing) : { ...BLANK });
  }, [editing]);

  const set = (key) => (event) => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    // Exactly one discount field is sent. The API requires at least one but never
    // rejects both, so a promotion carrying both would silently pick a winner at
    // checkout — the form therefore commits to a single mode.
    const useAmount = draft.useAmount;
    const amount = Number(draft.discountAmount);
    const percent = Number(draft.discountPercent);

    const payload = {
      title: draft.title,
      type: draft.type,
      startDate: draft.startDate,
      endDate: draft.endDate,
      ...(useAmount && amount > 0
        ? { discountAmount: amount }
        : percent > 0
          ? { discountPercent: percent }
          : {}),
    };

    try {
      if (editing?._id) {
        await update.mutateAsync({ id: editing._id, ...payload });
      } else {
        await create.mutateAsync(payload);
      }
      onClose();
    } catch {
      /* the mutation raises its own toast */
    }
  };

  const isPending = create.isPending || update.isPending;
  const usePercent = !draft.useAmount;

  return (
    <form onSubmit={submit} className="mb-6 rounded-2xl bg-surface p-5 shadow-card sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-lg">{editing ? "Edit promotion" : "New promotion"}</h2>
        <button type="button" onClick={onClose} className="btn-ghost btn-sm" aria-label="Close form">
          <X size={16} aria-hidden="true" />
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="promo-title" className="label">
            Title
          </label>
          <input
            id="promo-title"
            type="text"
            required
            minLength={3}
            maxLength={200}
            value={draft.title}
            onChange={set("title")}
            placeholder="20% off all cuts this month"
            className="input"
          />
        </div>

        <div>
          <label htmlFor="promo-type" className="label">
            Type
          </label>
          <select id="promo-type" value={draft.type} onChange={set("type")} className="input">
            {PROMOTION_TYPES.map((type) => (
              <option key={type} value={type}>
                {titleCase(type)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <span className="label">Discount</span>
          <p className="hint mb-1.5">
            {usePercent ? "Percentage off — the amount field is ignored." : "Amount off — the percentage field is ignored."}
          </p>
          <div className="flex items-center gap-2">
            <label htmlFor="promo-percent" className="sr-only">
              Percentage off
            </label>
            <input
              id="promo-percent"
              type="number"
              min={1}
              max={100}
              step={1}
              disabled={!usePercent}
              value={draft.discountPercent}
              onFocus={() => setDraft((prev) => ({ ...prev, useAmount: false }))}
              onChange={set("discountPercent")}
              placeholder="%"
              className="input tabular-nums disabled:cursor-not-allowed disabled:opacity-50"
            />
            <span aria-hidden="true" className="text-muted-foreground">
              or
            </span>
            <label htmlFor="promo-amount" className="sr-only">
              Amount off
            </label>
            <input
              id="promo-amount"
              type="number"
              min={0}
              step="0.5"
              disabled={usePercent}
              value={draft.discountAmount}
              onFocus={() => setDraft((prev) => ({ ...prev, useAmount: true }))}
              onChange={set("discountAmount")}
              placeholder="£"
              className="input tabular-nums disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>

        <div>
          <label htmlFor="promo-start" className="label">
            Starts
          </label>
          <input
            id="promo-start"
            type="date"
            required
            value={draft.startDate}
            onChange={set("startDate")}
            className="input"
          />
        </div>

        <div>
          <label htmlFor="promo-end" className="label">
            Ends
          </label>
          <input
            id="promo-end"
            type="date"
            required
            min={draft.startDate}
            value={draft.endDate}
            onChange={set("endDate")}
            className="input"
          />
          <p className="hint mt-1.5">Must be after the start date.</p>
        </div>
      </div>

      <div className="mt-5 flex justify-end gap-3 border-t border-border pt-5">
        <button type="button" onClick={onClose} className="btn-ghost">
          Cancel
        </button>
        <button type="submit" disabled={isPending} className="btn-primary">
          {isPending && <Loader2 size={15} className="animate-spin" aria-hidden="true" />}
          {editing ? "Save changes" : "Create promotion"}
        </button>
      </div>
    </form>
  );
}

/** API document -> form state (dates become yyyy-mm-dd input values). */
function toFormValues(promotion) {
  // A stored promotion should only ever have one discount; if both are somehow
  // present, the percent wins here, matching how checkout resolves it.
  const useAmount =
    promotion.discountPercent == null && promotion.discountAmount != null;

  return {
    title: promotion.title,
    type: promotion.type,
    useAmount,
    discountPercent: promotion.discountPercent ?? (useAmount ? "" : 10),
    discountAmount: promotion.discountAmount ?? "",
    startDate: toDateInput(promotion.startDate),
    endDate: toDateInput(promotion.endDate),
  };
}

function PromotionRow({ promotion, onEdit, onDeactivate, isDeactivating }) {
  const hasDiscount =
    promotion.discountPercent ? `${promotion.discountPercent}% off` : null;
  const flatDiscount =
    promotion.discountAmount !== undefined && promotion.discountAmount !== null
      ? `${formatCurrency(promotion.discountAmount)} off`
      : null;

  return (
    <li className="rounded-2xl bg-surface p-5 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold">{promotion.title}</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {titleCase(promotion.type)} · {hasDiscount ?? flatDiscount ?? "No discount set"}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {new Date(promotion.startDate).toLocaleDateString("en-GB")} →{" "}
            {new Date(promotion.endDate).toLocaleDateString("en-GB")}
          </p>
        </div>
        <StatusBadge
          status={promotion.isActive ? "approved" : "rejected"}
          label={promotion.isActive ? "Active" : "Inactive"}
        />
      </div>

      {promotion.isActive && (
        <div className="mt-4 flex gap-2 border-t border-border pt-3.5">
          <button type="button" onClick={() => onEdit(promotion)} className="btn-outline btn-sm">
            <Pencil size={13} aria-hidden="true" />
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDeactivate(promotion)}
            disabled={isDeactivating}
            className="btn-ghost btn-sm text-danger"
          >
            <Trash2 size={13} aria-hidden="true" />
            Deactivate
          </button>
        </div>
      )}
    </li>
  );
}

export default function OwnerPromotions() {
  const { data, isLoading, error } = usePromotions({ page: 1, limit: 100 });
  const deactivate = useDeactivatePromotion();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const promotions = data?.items ?? data?.promotions ?? [];

  if (error) {
    return <EmptyState icon={Tag} title="Could not load promotions" description={error.message} />;
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl">Promotions</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Discounts customers see on your public page.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
          className="btn-primary btn-sm"
        >
          <Plus size={15} aria-hidden="true" />
          New promotion
        </button>
      </header>

      {formOpen && <PromotionForm editing={editing} onClose={() => setFormOpen(false)} />}

      {isLoading ? (
        <div className="space-y-3" aria-busy="true">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="skeleton h-28 w-full rounded-2xl" />
          ))}
        </div>
      ) : promotions.length === 0 ? (
        <EmptyState
          icon={Tag}
          title="No promotions"
          description="Run a time-limited discount to bring customers back. Promotions are shown on your public page while they are active."
          action={
            <button type="button" onClick={() => setFormOpen(true)} className="btn-primary btn-sm">
              <Plus size={15} aria-hidden="true" />
              Create a promotion
            </button>
          }
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {promotions.map((promotion) => (
            <PromotionRow
              key={promotion._id}
              promotion={promotion}
              isDeactivating={deactivate.isPending}
              onEdit={(item) => {
                setEditing(item);
                setFormOpen(true);
              }}
              onDeactivate={(item) => {
                if (window.confirm(`Deactivate "${item.title}"?`)) {
                  deactivate.mutate(item._id);
                }
              }}
            />
          ))}
        </ul>
      )}

      <p className="text-xs leading-relaxed text-muted-foreground">
        A promotion needs either a percentage or a fixed amount off, and its end date must fall after
        its start date. The API rejects anything else.
      </p>
    </div>
  );
}
