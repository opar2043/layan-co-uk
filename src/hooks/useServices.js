"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import API from "@/lib/endpoints";

/**
 * Services belonging to a business.
 *
 * `GET /services` requires `businessId` for public callers, but falls back to the
 * JWT's own business for an owner or staff member — so the owner dashboard can call
 * this with no argument and still receive its own services, including the
 * deactivated ones only an owner is allowed to see.
 */

const keys = {
  list: (businessId) => ["services", businessId ?? "mine"],
  detail: (id) => ["services", "detail", id],
};

export function useServices(businessId, { enabled = true } = {}) {
  return useQuery({
    queryKey: keys.list(businessId),
    queryFn: () => api.get(API.services({ businessId })),
    enabled,
  });
}

export function useService(id) {
  return useQuery({
    queryKey: keys.detail(id),
    queryFn: () => api.get(API.serviceById(id)),
    enabled: Boolean(id),
  });
}

function useInvalidateServices(businessId) {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: keys.list(businessId) });
    queryClient.invalidateQueries({ queryKey: ["services"] });
    // A new or deleted service changes what the public profile renders.
    queryClient.invalidateQueries({ queryKey: ["businesses"] });
  };
}

export function useCreateService(businessId) {
  const invalidate = useInvalidateServices(businessId);
  return useMutation({
    // POST /services derives the owner from the JWT — `businessId` in the body or
    // query string is ignored, so nothing is sent.
    mutationFn: (payload) => api.post(API.services(), payload),
    onSuccess: () => {
      toast.success("Service created");
      invalidate();
    },
    onError: (error) => toast.error(error.message || "Could not create the service"),
  });
}

export function useUpdateService(businessId) {
  const invalidate = useInvalidateServices(businessId);
  return useMutation({
    mutationFn: ({ id, ...payload }) => api.patch(API.serviceById(id), payload),
    onSuccess: () => {
      toast.success("Service updated");
      invalidate();
    },
    onError: (error) => toast.error(error.message || "Could not update the service"),
  });
}

export function useDeleteService(businessId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(API.serviceById(id)),
    onSuccess: () => {
      toast.success("Service deleted");
      queryClient.invalidateQueries({ queryKey: ["services"] });
      queryClient.invalidateQueries({ queryKey: ["businesses"] });
    },
    onError: (error) => toast.error(error.message || "Could not delete the service"),
  });
}

export default useServices;
