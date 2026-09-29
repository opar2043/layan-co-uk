"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import API from "@/lib/endpoints";

/**
 * Businesses + the signed-in owner's own listing.
 *
 * GET /businesses only returns verified businesses to non-admins, so a brand-new
 * owner's listing is invisible here — that is why `useMyBusiness` exists and why
 * the owner dashboard uses it instead of `useSearchBusinesses`.
 */

const keys = {
  all: ["businesses"],
  search: (filters) => ["businesses", "search", filters],
  byId: (id) => ["businesses", "detail", id],
  mine: ["businesses", "me"],
  pending: ["businesses", "pending"],
};

export function useSearchBusinesses(filters = {}) {
  return useQuery({
    queryKey: keys.search(filters),
    queryFn: () => api.get(API.businesses(filters)),
    // Keep the previous page on screen while the next one loads, so the grid does
    // not collapse to skeletons on every keystroke.
    placeholderData: (previous) => previous,
  });
}

export function useBusiness(id) {
  return useQuery({
    queryKey: keys.byId(id),
    queryFn: () => api.get(API.businessById(id)),
    enabled: Boolean(id),
  });
}

export function useMyBusiness({ enabled = true } = {}) {
  return useQuery({
    queryKey: keys.mine,
    queryFn: () => api.get(API.businessMe),
    enabled,
    // An owner without a listing is a legitimate state, not a failure.
    retry: false,
  });
}

export function useUpdateBusiness() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => api.patch(API.businessMe, payload),
    onSuccess: () => {
      toast.success("Business profile updated");
      queryClient.invalidateQueries({ queryKey: keys.mine });
      queryClient.invalidateQueries({ queryKey: keys.all });
    },
    onError: (error) => toast.error(error.message || "Could not update the business"),
  });
}

export function usePendingBusinesses({ enabled = true } = {}) {
  return useQuery({
    queryKey: keys.pending,
    queryFn: () => api.get(API.businessesPending),
    enabled,
  });
}

export function useVerifyBusiness() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => api.patch(API.businessVerify(id), { status }),
    onSuccess: (data) => {
      toast.success(data?.business?.businessName ? `${data.business.businessName} — ${data.business.verificationStatus}` : "Verification updated");
      queryClient.invalidateQueries({ queryKey: keys.pending });
      queryClient.invalidateQueries({ queryKey: keys.all });
    },
    onError: (error) => toast.error(error.message || "Could not update verification"),
  });
}

export default useSearchBusinesses;
