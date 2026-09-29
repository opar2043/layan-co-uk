"use client";

import { useMemo, useState } from "react";
import { Tag, Plus, Trash2, Percent, Loader2, Info } from "lucide-react";
import { usePromotions, useCreatePromotion, useDeactivatePromotion } from "@/hooks/usePromotions";
import StatusBadge from "@/components/Public/StatusBadge";
import EmptyState from "@/components/Public/EmptyState";
import { formatCurrency, formatDate, idOf, titleCase, toDateInput } from "@/lib/utils";
import { PROMOTION_TYPES } from "@/lib/constants";

const emptyDraft = {
  title: "",
  type: PROMOTION_TYPES[0],
  usePercent: true,
  discountPercent: "",
  discountAmount: "",
  startDate: toDateInput(),
  endDate: "",
};

/**
 * Promotion editor.
 *
 * The API requires at least one of `discountPercent` / `discountAmount` and never
 * validates that they are mutually exclusive, so the two inputs are kept in one
 * switchable group here and only the chosen one is submitted.
 */
function PromotionForm({ onSubmit, isPending }) {
  const [draft, setDraft] = useState(emptyDraft);

  const update = (patch) => setDraft((prev) => ({ ...prev, ...patch }));
  const useAmount = !draft.usePercent;
  const value = useAmount ? draft.discountAmount : draft.discountPercent;
  const isValid =
    draft.title.trim().length >= 3 &&
    Boolean(draft.startDate) &&
    Boolean(draft.endDate) &&
    draft.endDate > draft.startDate &&
    Number(value) > 0;

  const submit = (event) => {
    event.preventDefault();
    if (!isValid) return;
    onSubmit({
      title: draft.title.trim(),
      type: draft.type,
      startDate: draft.startDate,
      endDate: draft.endDate,
      ...(useAmount
        ? { discountAmount: Number(draft.discountAmount) }
        : { discountPercent: Number(draft.discountPercent) }),
    });
    setDraft(emptyDraft);
  };

  return (
    <form onSubmit={submit} className="rounded-2xl bg-surface p-5 shadow-card sm:p-6">
      <h2 className="text-base font-semibold">Create a platform promotion</h2>
      <p className="mt-1 mb-5 text-xs leading-relaxed text-muted-foreground">
        Admin promotions apply to every business — they are shown alongside each business&apos;s own
        promotions because <code className="rounded bg-muted px-1">businessId</code> is left null.
      </p>

      <div className="space-y-4">
        <div>
          <label htmlFor="promo-title" className="label">
            Title
          </label>
          <input
            id="promo-title"
            type="text"
            minLength={3}
            maxLength={200}
            required
            value={draft.title}
            onChange={(event) => update({ title: event.target.value })}
            placeholder="Autumn offer — 20% off"
            className="input"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="promo-type" className="label">
              Type
            </label>
            <select
              id="promo-type"
              value={draft.type}
              onChange={(event) => update({ type: event.target.value })}
              className="input"
            >
              {PROMOTION_TYPES.map((type) => (
                <option key={type} value={type}>
                  {titleCase(type)}
                </option>
              ))}
            </select>
          </div>

          <fieldset>
            <legend className="label">Discount</legend>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => update({ usePercent: true })}
                aria-pressed={draft.usePercent}
                className={`btn-outline btn-sm ${draft.usePercent ? "border-accent text-accent" : ""}`}
              >
                <Percent size={13} aria-hidden="true" />
                Percent
              </button>
              <button
                type="button"
                onClick={() => update({ usePercent: false })}
                aria-pressed={useAmount}
                className={`btn-outline btn-sm ${useAmount ? "border-accent text-accent" : ""}`}
              >
                Fixed amount
              </button>
            </div>
          </fieldset>
        </div>

        {useAmount ? (
          <div>
            <label htmlFor="promo-amount" className="label">
              Amount off
            </label>
            <input
              id="promo-amount"
              type="number"
              min={0}
              step="0.01"
              required
              value={draft.discountAmount}
              onChange={(event) => update({ discountAmount: event.target.value })}
              className="input"
            />
          </div>
        ) : (
          <div>
            <label htmlFor="promo-percent" className="label">
              Percent off
            </label>
            <input
              id="promo-percent"
              type="number"
              min={1}
              max={100}
              required
              value={draft.discountPercent}
              onChange={(event) => update({ discountPercent: event.target.value })}
              className="input"
            />
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="promo-start" className="label">
              Starts
            </label>
            <input
              id="promo-start"
              type="date"
              required
              value={draft.startDate}
              onChange={(event) => update({ startDate: event.target.value })}
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
              onChange={(event) => update({ endDate: event.target.value })}
              className="input"
            />
          </div>
        </div>

        {draft.startDate && draft.endDate && draft.endDate <= draft.startDate && (
          <p className="text-xs text-danger">The end date must be after the start date.</p>
        )}
      </div>

      <div className="mt-5 flex justify-end border-t border-border pt-4">
        <button type="submit" disabled={!isValid || isPending} className="btn-primary btn-sm">
          {isPending && <Loader2 size={13} className="animate-spin" aria-hidden="true" />}
          <Plus size={13} aria-hidden="true" />
          Create promotion
        </button>
      </div>
    </form>
  );
}

export default function AdminPromotions() {
  const { data, isLoading, error } = usePromotions();
  const create = useCreatePromotion();
  const deactivate = useDeactivatePromotion();

  const promotions = useMemo(() => data?.promotions ?? [], [data]);

  if (error) {
    return <EmptyState icon={Tag} title="Could not load promotions" description={error.message} />;
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl sm:text-3xl">Promotions</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Platform-wide offers shown to every customer.
        </p>
      </header>

      <p className="flex items-start gap-2 rounded-xl bg-muted px-4 py-3 text-xs leading-relaxed text-muted-foreground">
        <Info size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
        This list endpoint returns only promotions that are <strong>active and currently in their date
        window</strong>, so expired or deactivated offers are not shown here. Deleting a promotion
        soft-deactivates it rather than removing the record.
      </p>

      {isLoading ? (
        <div className="skeleton h-40 w-full rounded-2xl" aria-busy="true" />
      ) : promotions.length === 0 ? (
        <EmptyState
          icon={Tag}
          title="No live promotions"
          description="Create one below, or schedule it to start on a future date."
        />
      ) : (
        <ul className="space-y-3">
          {promotions.map((promotion) => (
            <li key={idOf(promotion)} className="rounded-2xl bg-surface p-5 shadow-card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate text-base font-semibold">{promotion.title}</h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatDate(promotion.startDate)} – {formatDate(promotion.endDate)}
                  </p>
                </div>
                <StatusBadge status={promotion.isActive ? "active" : "inactive"} label={titleCase(promotion.type)} />
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <p className="text-lg font-bold text-accent">
                  {promotion.discountPercent != null
                    ? `${promotion.discountPercent}% off`
                    : `${formatCurrency(promotion.discountAmount ?? 0)} off`}
                </p>
                {promotion.discountPercent != null && promotion.discountAmount != null && (
                  <p className="text-xs text-muted-foreground">
                    Both a percent and an amount are stored; the percent takes precedence at checkout.
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => deactivate.mutate(idOf(promotion))}
                  disabled={deactivate.isPending}
                  className="btn-ghost btn-sm ml-auto text-danger"
                >
                  <Trash2 size={13} aria-hidden="true" />
                  Deactivate
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <PromotionForm onSubmit={(payload) => create.mutate(payload)} isPending={create.isPending} />
    </div>
  );
}
