"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import API from "@/lib/endpoints";
import useAuth from "@/components/Auth/useAuth";

/**
 * Customer profile + favourites.
 *
 * All customer routes are authorised by the `x-firebase-uid` header rather than a
 * JWT, so these only work once Firebase has a signed-in user and the provider has
 * pushed the uid into the Axios interceptor.
 */

const keys = {
  me: ["users", "me"],
  all: ["users", "all"],
};

export function useMyProfile({ enabled = true } = {}) {
  return useQuery({
    queryKey: keys.me,
    queryFn: () => api.get(API.userMe),
    enabled,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { refresh } = useAuth();
  return useMutation({
    mutationFn: (payload) => api.patch(API.userMe, payload),
    onSuccess: (data) => {
      toast.success("Profile updated");
      queryClient.setQueryData(keys.me, data);
      refresh();
    },
    onError: (error) => toast.error(error.message || "Could not update your profile"),
  });
}

/**
 * Body is `{ businessId, action: "add" | "remove" }`. The backend responds with
 * the whole updated user, which is used to patch the cache directly so the heart
 * on the business card flips without a refetch.
 */
export function useToggleFavourite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ businessId, action }) =>
      api.patch(API.userMeFavourites, { businessId, action }),
    onSuccess: (data, variables) => {
      // The API answers with `{ user }`, the same envelope `useMyProfile` caches,
      // so patching with the whole response keeps every reader consistent.
      queryClient.setQueryData(keys.me, data);
      queryClient.invalidateQueries({ queryKey: ["businesses"] });
      toast.success(variables.action === "add" ? "Added to favourites" : "Removed from favourites");
    },
    onError: (error) => toast.error(error.message || "Could not update favourites"),
  });
}

/** Admin only — the platform-wide customer list. */
export function useUsers(params = {}, { enabled = false } = {}) {
  return useQuery({
    queryKey: ["users", "all", params],
    queryFn: () => api.get(API.users(params)),
    enabled,
  });
}

/**
 * Reads the signed-in customer's favourite business ids out of the cached profile.
 *
 * The field is `favouriteBusinessIds` (ObjectIds, serialised to hex strings) — the
 * profile stores ids only, so anything that needs a full business must fetch it.
 *
 * The query is gated on a Firebase customer session: `GET /users/me` is authorised
 * by `x-firebase-uid`, so an anonymous visitor on /search would otherwise fire a
 * guaranteed 401 on every page load.
 */
export function useFavouriteIds() {
  const { isCustomer, isLoading } = useAuth();
  const { data } = useMyProfile({ enabled: isCustomer && !isLoading });
  return data?.user?.favouriteBusinessIds ?? [];
}

export default useMyProfile;
