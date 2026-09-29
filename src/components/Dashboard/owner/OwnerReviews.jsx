"use client";

import { useState } from "react";
import { Star, MessageSquareReply, Loader2 } from "lucide-react";
import { useReviews, useReplyToReview } from "@/hooks/useReviews";
import { useMyBusiness } from "@/hooks/useBusinesses";
import StatusBadge from "@/components/Public/StatusBadge";
import Rating from "@/components/Public/Rating";
import EmptyState from "@/components/Public/EmptyState";
import { formatDate, idOf } from "@/lib/utils";

/** The five sub-scores the API records alongside `overall`. */
const SUB_RATINGS = [
  { key: "service", label: "Service" },
  { key: "cleanliness", label: "Cleanliness" },
  { key: "value", label: "Value" },
  { key: "professionalism", label: "Professionalism" },
  { key: "punctuality", label: "Punctuality" },
];

/**
 * Inline reply box.
 *
 * `businessReply` is a plain string on the review (not an object), and the API
 * accepts a single reply — once set, it is shown read-only.
 */
function ReplyBox({ review }) {
  const reply = useReplyToReview();
  const [text, setText] = useState("");

  if (review.businessReply) {
    return (
      <div className="mt-3 rounded-xl bg-muted px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Your reply
        </p>
        <p className="mt-1 text-sm">{review.businessReply}</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        await reply.mutateAsync({ id: idOf(review), reply: text.trim() });
        setText("");
      }}
      className="mt-3"
    >
      <label htmlFor={`reply-${idOf(review)}`} className="label">
        Reply publicly
      </label>
      <textarea
        id={`reply-${idOf(review)}`}
        rows={2}
        required
        maxLength={2000}
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Thanks for your feedback…"
        className="input resize-y"
      />
      <div className="mt-2 flex justify-end">
        <button type="submit" disabled={reply.isPending || !text.trim()} className="btn-outline btn-sm">
          {reply.isPending ? (
            <Loader2 size={13} className="animate-spin" aria-hidden="true" />
          ) : (
            <MessageSquareReply size={13} aria-hidden="true" />
          )}
          Post reply
        </button>
      </div>
    </form>
  );
}

export default function OwnerReviews() {
  const [page, setPage] = useState(1);
  // GET /reviews needs an explicit businessId even for the business's own account.
  const { data: businessData, isLoading: businessLoading } = useMyBusiness();
  const businessId = (businessData?.business ?? businessData)?._id;

  const { data, isLoading, error } = useReviews(
    { businessId, page, limit: 10 },
    { enabled: Boolean(businessId) }
  );

  const reviews = data?.items ?? [];

  if (error) {
    return <EmptyState icon={Star} title="Could not load reviews" description={error.message} />;
  }

  const isLoadingAll = businessLoading || (isLoading && !error);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl sm:text-3xl">Reviews</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          What customers said after their visit. You can reply to each one.
        </p>
      </header>

      {isLoadingAll ? (
        <div className="space-y-3" aria-busy="true">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="skeleton h-44 w-full rounded-2xl" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <EmptyState
          icon={Star}
          title="No reviews yet"
          description="Customers can review a booking once it is marked attended. Encourage them at checkout and your rating will build up over time."
        />
      ) : (
        <ul className="space-y-4">
          {reviews.map((review) => {
            const ratings = review.ratings ?? {};
            const hasSubRatings = SUB_RATINGS.some(({ key }) => typeof ratings[key] === "number");
            return (
              <li key={idOf(review)} className="rounded-2xl bg-surface p-5 shadow-card">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{review.customer?.name ?? "Customer"}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(review.createdAt)}
                      {review.businessReply && " · replied"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Rating value={ratings.overall ?? 0} showValue />
                    <StatusBadge status="approved" label="Verified" />
                  </div>
                </div>

                {review.comment && <p className="mt-3 text-sm leading-relaxed">{review.comment}</p>}

                {hasSubRatings && (
                  <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 sm:grid-cols-3">
                    {SUB_RATINGS.filter(({ key }) => typeof ratings[key] === "number").map(({ key, label }) => (
                      <div key={key} className="flex items-center justify-between gap-2 text-sm">
                        <dt className="text-muted-foreground">{label}</dt>
                        <dd className="font-semibold tabular-nums">{ratings[key]}/5</dd>
                      </div>
                    ))}
                  </dl>
                )}

                <ReplyBox review={review} />
              </li>
            );
          })}
        </ul>
      )}

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setPage((prev) => prev - 1)}
            disabled={page <= 1}
            className="btn-outline btn-sm"
          >
            Previous
          </button>
          <p className="text-sm text-muted-foreground">
            Page {data.page} of {data.totalPages}
          </p>
          <button
            type="button"
            onClick={() => setPage((prev) => prev + 1)}
            disabled={!data.hasNextPage}
            className="btn-outline btn-sm"
          >
            Next
          </button>
        </div>
      )}

      <p className="text-xs leading-relaxed text-muted-foreground">
        A review is only accepted once a booking is marked attended, and the API allows one review and one
        reply per appointment.
      </p>
    </div>
  );
}
