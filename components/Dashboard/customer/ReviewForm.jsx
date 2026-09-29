"use client";

import { useState } from "react";
import { Star, Loader2, X } from "lucide-react";
import { useCreateReview } from "@/hooks/useReviews";
import { idOf } from "@/lib/utils";

/** The sub-scores the API accepts; each one inherits `overall` when left blank. */
const SUB_SCORES = [
  { key: "service", label: "Service quality" },
  { key: "cleanliness", label: "Cleanliness" },
  { key: "value", label: "Value for money" },
  { key: "professionalism", label: "Professionalism" },
  { key: "punctuality", label: "Punctuality" },
];

/** 1-5 star input, keyboard accessible via a radio group. */
function StarRating({ id, label, value, onChange, size = 18 }) {
  return (
    <fieldset>
      <legend className="label">{label}</legend>
      <div className="flex items-center gap-1" role="radiogroup" aria-label={label}>
        {[1, 2, 3, 4, 5].map((star) => (
          <label
            key={star}
            htmlFor={`${id}-${star}`}
            className="cursor-pointer p-0.5"
            title={`${star} star${star > 1 ? "s" : ""}`}
          >
            <input
              id={`${id}-${star}`}
              type="radio"
              name={id}
              value={star}
              checked={value === star}
              onChange={() => onChange(star)}
              className="sr-only"
            />
            <Star
              size={size}
              aria-hidden="true"
              className={star <= value ? "fill-warning text-warning" : "text-border"}
            />
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/**
 * Review submission.
 *
 * The API only accepts a review for a booking the customer attended
 * (`isVerifiedReviewEligible`), takes `bookingId` plus a `ratings` object whose
 * `overall` is required, and allows exactly one review per booking.
 */
export default function ReviewForm({ booking, onClose }) {
  const create = useCreateReview();
  const [overall, setOverall] = useState(0);
  const [subScores, setSubScores] = useState({});
  const [comment, setComment] = useState("");

  const bookingId = idOf(booking);
  const isValid = overall >= 1;

  const submit = async (event) => {
    event.preventDefault();
    if (!isValid) return;

    // Blank sub-scores are omitted so the API falls back to `overall` itself.
    const ratings = {
      overall,
      ...Object.fromEntries(Object.entries(subScores).filter(([, value]) => value > 0)),
    };

    try {
      await create.mutateAsync({ bookingId, ratings, ...(comment.trim() ? { comment: comment.trim() } : {}) });
      onClose();
    } catch {
      /* the mutation raises its own toast */
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-form-title"
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-surface p-6 shadow-xl">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 id="review-form-title" className="text-lg font-semibold">
              Rate your appointment
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {booking?.service?.name ?? "Your booking"}
              {booking?.business?.businessName ? ` · ${booking.business.businessName}` : ""}
            </p>
          </div>
          <button type="button" onClick={onClose} className="btn-ghost btn-sm" aria-label="Close">
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-5">
          <StarRating
            id="review-overall"
            label="Overall"
            value={overall}
            onChange={setOverall}
            size={26}
          />
          {overall === 0 && (
            <p className="-mt-3 text-xs text-danger">Pick an overall rating to continue.</p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {SUB_SCORES.map((score) => (
              <StarRating
                key={score.key}
                id={`review-${score.key}`}
                label={score.label}
                value={subScores[score.key] ?? 0}
                onChange={(value) => setSubScores((prev) => ({ ...prev, [score.key]: value }))}
                size={16}
              />
            ))}
          </div>

          <div>
            <label htmlFor="review-comment" className="label">
              Comments <span className="font-normal text-muted-foreground">(optional)</span>
            </label>
            <textarea
              id="review-comment"
              rows={4}
              maxLength={4000}
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="How was your experience?"
              className="input"
            />
          </div>

          <p className="text-xs leading-relaxed text-muted-foreground">
            Any rating you leave blank defaults to your overall score. One review is allowed per
            booking, and the business can reply publicly.
          </p>

          <div className="flex gap-2 border-t border-border pt-4">
            <button type="button" onClick={onClose} className="btn-outline flex-1">
              Cancel
            </button>
            <button type="submit" disabled={!isValid || create.isPending} className="btn-accent flex-1">
              {create.isPending && <Loader2 size={15} className="animate-spin" aria-hidden="true" />}
              Submit review
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
