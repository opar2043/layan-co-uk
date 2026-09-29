"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import API from "@/lib/endpoints";

/**
 * Chat.
 *
 * GET /messages returns ONE full thread oldest-first, not a list of threads. A
 * customer passes `?businessId=`, the business side passes `?customerId=`. The
 * thread list itself is a separate call, `GET /messages/threads`.
 */

const keys = {
  thread: (params) => ["messages", "thread", params],
  threads: ["messages", "threads"],
};

export function useMessages(params = {}, { enabled = true } = {}) {
  return useQuery({
    queryKey: keys.thread(params),
    queryFn: () => api.get(API.messages(params)),
    enabled: enabled && Boolean(params.businessId || params.customerId),
  });
}

export function useThreads({ enabled = true } = {}) {
  return useQuery({
    queryKey: keys.threads,
    queryFn: () => api.get(API.messageThreads),
    enabled,
  });
}

/** Customers send `{ businessId, text }`; the business side adds `customerId`. */
export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => api.post(API.messages(), payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
    onError: (error) => toast.error(error.message || "Could not send the message"),
  });
}

export default useMessages;
