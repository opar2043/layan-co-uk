"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import API from "@/lib/endpoints";

/**
 * Promotions.
 *
 * GET /promotions only returns promotions whose window contains "now", so an
 * owner's management view is necessarily a view of live offers — drafts that have
 * not started do not come back. `type` is one of the seven PromotionType values.
 */

const keys = {
  list: (params) => ["promotions", "list", params],
};

export function usePromotions(params = {}, { enabled = true } = {}) {
  return useQuery({
    queryKey: keys.list(params),
    queryFn: () => api.get(API.promotions(params)),
    enabled: enabled && Boolean(params.businessId),
  });
}

export function useCreatePromotion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => api.post(API.promotions(), payload),
    onSuccess: () => {
      toast.success("Promotion created");
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
    },
    onError: (error) => toast.error(error.message || "Could not create the promotion"),
  });
}

export function useUpdatePromotion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) => api.patch(API.promotionById(id), payload),
    onSuccess: () => {
      toast.success("Promotion updated");
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
    },
    onError: (error) => toast.error(error.message || "Could not update the promotion"),
  });
}

/** Soft-deactivates on the server — the document is kept for the audit trail. */
export function useDeactivatePromotion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(API.promotionById(id)),
    onSuccess: () => {
      toast.success("Promotion deactivated");
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
    },
    onError: (error) => toast.error(error.message || "Could not deactivate the promotion"),
  });
}

export default usePromotions;
