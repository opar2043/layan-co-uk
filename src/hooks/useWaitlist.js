"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import API from "@/lib/endpoints";

/**
 * Waitlist. Customers join; the business works the queue.
 *
 * `GET /waitlist` is scoped entirely by the caller: a customer passes
 * `?businessId=` to see one business's queue, while an owner passes nothing and the
 * API resolves their own business from the JWT. So the query is enabled regardless
 * of params — a businessId is only needed to narrow a customer's view.
 */

const keys = {
  list: (params) => ["waitlist", "list", params],
};

export function useWaitlist(params = {}, { enabled = true } = {}) {
  return useQuery({
    queryKey: keys.list(params),
    queryFn: () => api.get(API.waitlist(params)),
    enabled,
  });
}

/**
 * Body: `{ serviceId, preferredDates, preferredStaffId?, isInstantSlotDiscount? }`.
 *
 * The business is derived from the service server-side, so the two cannot disagree
 * and `businessId` must NOT be sent. `preferredDates` is an array of datetimes.
 */
export function useJoinWaitlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => api.post(API.waitlist(), payload),
    onSuccess: () => {
      toast.success("Added to the waitlist");
      queryClient.invalidateQueries({ queryKey: keys.list() });
    },
    onError: (error) => toast.error(error.message || "Could not join the waitlist"),
  });
}

/** Business side: offer a slot (`notified`) or mark it converted (`booked`). */
export function useUpdateWaitlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) => api.patch(API.waitlistById(id), payload),
    onSuccess: () => {
      toast.success("Waitlist entry updated");
      queryClient.invalidateQueries({ queryKey: keys.list() });
    },
    onError: (error) => toast.error(error.message || "Could not update the waitlist entry"),
  });
}

export function useLeaveWaitlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(API.waitlistById(id)),
    onSuccess: () => {
      toast.success("Removed from the waitlist");
      queryClient.invalidateQueries({ queryKey: keys.list() });
    },
    onError: (error) => toast.error(error.message || "Could not leave the waitlist"),
  });
}

export default useWaitlist;
