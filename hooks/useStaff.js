"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import API from "@/lib/endpoints";

/** Staff roster. Owner-scoped on the backend — a businessId is never sent. */

const keys = {
  list: (params) => ["staff", "list", params],
  detail: (id) => ["staff", "detail", id],
};

export function useStaff(params = {}, { enabled = true } = {}) {
  return useQuery({
    queryKey: keys.list(params),
    queryFn: () => api.get(API.staff),
    enabled,
    placeholderData: (previous) => previous,
  });
}

export function useStaffMember(id) {
  return useQuery({
    queryKey: keys.detail(id),
    queryFn: () => api.get(API.staffById(id)),
    enabled: Boolean(id),
  });
}

export function useCreateStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => api.post(API.staff, payload),
    onSuccess: () => {
      toast.success("Staff member added");
      queryClient.invalidateQueries({ queryKey: keys.list() });
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
    onError: (error) => toast.error(error.message || "Could not add the staff member"),
  });
}

export function useUpdateStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) => api.patch(API.staffById(id), payload),
    onSuccess: () => {
      toast.success("Staff member updated");
      queryClient.invalidateQueries({ queryKey: ["staff"] });
    },
    onError: (error) => toast.error(error.message || "Could not update the staff member"),
  });
}

export function useDeleteStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(API.staffById(id)),
    onSuccess: () => {
      toast.success("Staff member removed");
      queryClient.invalidateQueries({ queryKey: ["staff"] });
    },
    onError: (error) => toast.error(error.message || "Could not remove the staff member"),
  });
}

export default useStaff;
