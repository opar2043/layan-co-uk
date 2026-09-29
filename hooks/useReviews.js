"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import API from "@/lib/endpoints";

/** Reviews. Public to read, customer to write, business to reply. */

const keys = {
  list: (params) => ["reviews", "list", params],
};

/**
 * `GET /reviews` is public and always requires `businessId` — even the business's
 * own dashboard must pass it, because the endpoint is not JWT-scoped.
 */
export function useReviews(params = {}, { enabled = true } = {}) {
  return useQuery({
    queryKey: keys.list(params),
    queryFn: () => api.get(API.reviews(params)),
    enabled: enabled && Boolean(params.businessId),
  });
}

/**
 * Only an `attended` booking is eligible — the backend enforces
 * `isVerifiedReviewEligible` and one review per booking, so the form surfaces
 * that state rather than letting the customer discover it at submit time.
 */
export function useCreateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => api.post(API.reviews(), payload),
    onSuccess: () => {
      toast.success("Thanks for your review");
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      queryClient.invalidateQueries({ queryKey: ["businesses"] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: (error) => toast.error(error.message || "Could not submit the review"),
  });
}

/** Body is `{ businessReply }` — the API rejects a bare `reply` key. */
export function useReplyToReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reply }) =>
      api.patch(API.reviewReply(id), { businessReply: reply }),
    onSuccess: () => {
      toast.success("Reply posted");
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
    onError: (error) => toast.error(error.message || "Could not post the reply"),
  });
}

export default useReviews;
