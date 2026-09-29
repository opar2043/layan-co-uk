import { formatDateTime } from "@/lib/utils";
import StatusBadge from "./StatusBadge";
import EmptyState from "./EmptyState";
import { MessageSquare } from "lucide-react";

/**
 * A single review. The backend already inlines the customer name, so there is no
 * second fetch here.
 *
 * The score lives at `ratings.overall` (the review also stores five sub-scores) and
 * the business's public reply is the `businessReply` string.
 */
export function ReviewCard({ review, onReply, canReply = false, isReplying = false }) {
  const name = review?.customer?.name ?? review?.customerName ?? review?.name ?? "Customer";
  const createdAt = review?.createdAt ?? review?.updatedAt;
  const score = review?.ratings?.overall;
  const reply = review?.businessReply ?? review?.reply;

  return (
    <article className="rounded-2xl bg-surface p-5 shadow-card sm:p-6">
      <div className="mb-3 flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold">{name}</p>
          <p className="text-xs text-muted-foreground">{formatDateTime(createdAt)}</p>
        </div>
        {typeof score === "number" && (
          <div className="flex items-center gap-0.5" aria-label={`${score} out of 5`}>
            {Array.from({ length: 5 }).map((_, index) => (
              <span
                key={index}
                className={`text-sm ${index < score ? "text-accent" : "text-border"}`}
                aria-hidden="true"
              >
                ★
              </span>
            ))}
          </div>
        )}
      </div>

      {review?.comment && <p className="text-sm leading-relaxed text-primary">{review.comment}</p>}

      {reply && (
        <div className="mt-4 rounded-xl border-l-2 border-accent bg-accent-light/50 p-3.5">
          <p className="mb-1 text-xs font-semibold text-accent">
            Reply from {review?.business?.businessName ?? "the business"}
          </p>
          <p className="text-sm leading-relaxed text-primary">{reply}</p>
        </div>
      )}

      {canReply && !reply && (
        <button
          type="button"
          onClick={() => onReply?.(review)}
          className="btn-outline btn-sm mt-4"
          disabled={isReplying}
        >
          {isReplying ? "Posting…" : "Reply"}
        </button>
      )}
    </article>
  );
}

export default function ReviewList({ reviews = [], loading, onReply, canReply = false, replyingId }) {
  if (loading) {
    return (
      <div className="space-y-4" aria-busy="true">
        {[0, 1, 2].map((index) => (
          <div key={index} className="skeleton h-32 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="No reviews yet"
        description="Once customers have completed an appointment, their feedback will appear here."
      />
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <ReviewCard
          key={review._id ?? review.id}
          review={review}
          onReply={onReply}
          canReply={canReply}
          isReplying={replyingId === (review._id ?? review.id)}
        />
      ))}
    </div>
  );
}
