"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import API from "@/lib/endpoints";

/** Platform operations. Every hook here is admin-only and disabled by default. */

const keys = {
  analytics: ["admin", "analytics"],
  fraud: ["admin", "fraud"],
  disputes: (params) => ["admin", "disputes", params],
};

export function useAdminAnalytics({ enabled = true } = {}) {
  return useQuery({
    queryKey: keys.analytics,
    queryFn: () => api.get(API.adminAnalytics),
    enabled,
  });
}

export function useFraudFlags({ enabled = true } = {}) {
  return useQuery({
    queryKey: keys.fraud,
    queryFn: () => api.get(API.adminFraudFlags),
    enabled,
  });
}

export function useDisputes(params = {}, { enabled = true } = {}) {
  return useQuery({
    queryKey: keys.disputes(params),
    queryFn: () => api.get(API.adminDisputes(params)),
    enabled,
    placeholderData: (previous) => previous,
  });
}

/** Any authenticated actor can raise a dispute; the customer UI uses this. */
export function useCreateDispute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => api.post(API.adminDisputes(), payload),
    onSuccess: () => {
      toast.success("Dispute raised");
      queryClient.invalidateQueries({ queryKey: ["admin", "disputes"] });
    },
    onError: (error) => toast.error(error.message || "Could not raise the dispute"),
  });
}

/** `status` is one of: open, under_review, resolved, rejected. */
export function useUpdateDispute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) => api.patch(API.adminDisputeById(id), payload),
    onSuccess: (data) => {
      toast.success(`Dispute set to ${data?.dispute?.status ?? "updated"}`);
      queryClient.invalidateQueries({ queryKey: ["admin", "disputes"] });
    },
    onError: (error) => toast.error(error.message || "Could not update the dispute"),
  });
}

export default useAdminAnalytics;
