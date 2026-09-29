"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import API from "@/lib/endpoints";

/** Bookings for the signed-in actor, whatever their role. */

const keys = {
  list: (params) => ["bookings", "list", params],
  detail: (id) => ["bookings", "detail", id],
};

export function useBookings(params = {}, { enabled = true } = {}) {
  return useQuery({
    queryKey: keys.list(params),
    queryFn: () => api.get(API.bookings(params)),
    enabled: enabled && Object.values(params).some((v) => v !== undefined && v !== ""),
  });
}

export function useBooking(id) {
  return useQuery({
    queryKey: keys.detail(id),
    queryFn: () => api.get(API.bookingById(id)),
    enabled: Boolean(id),
  });
}

/**
 * Body mirrors the backend's booking schema: `serviceId`, `startTime`, `staffId`
 * (optional — omit for "any available"), and optionally `depositAmount`,
 * `paymentMethod` and `consultationForm`.
 *
 * `businessId` and `notes` must not be sent: the backend derives the business
 * from the service and ignores any extra fields rather than rejecting them, so
 * they would fail silently. `endTime` and `totalPrice` are likewise derived
 * server-side, so the form never sends them.
 */
export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => api.post(API.bookings(), payload),
    onSuccess: () => {
      toast.success("Booking requested");
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["waitlist"] });
    },
    onError: (error) => toast.error(error.message || "Could not create the booking"),
  });
}

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => api.patch(API.bookingStatus(id), { status }),
    onSuccess: (data) => {
      toast.success(`Booking marked ${data?.booking?.status ?? "updated"}`);
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["waitlist"] });
    },
    onError: (error) => toast.error(error.message || "Could not update the booking"),
  });
}

/** Settles payment at the salon: `{ amountPaid, tip, paymentMethod }`. */
export function useCheckoutBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) => api.patch(API.bookingCheckout(id), payload),
    onSuccess: () => {
      toast.success("Payment recorded");
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: (error) => toast.error(error.message || "Could not record the payment"),
  });
}

export default useBookings;
