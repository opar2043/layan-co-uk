"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, Plus, X, Loader2, Zap } from "lucide-react";
import useAuth from "@/components/Auth/useAuth";
import { useJoinWaitlist } from "@/hooks/useWaitlist";
import { idOf, toDateInput } from "@/lib/utils";

const MAX_DATES = 5;

/**
 * Waitlist join form.
 *
 * `POST /waitlist` is Firebase-only (customers join on their own behalf) and
 * derives the business from the service, so the body carries `serviceId` and
 * never `businessId`. `preferredDates` must be a non-empty array of parseable
 * dates — the API rejects an empty one outright.
 */
export default function WaitlistJoin({ business, services = [], staff: staffProp = [] }) {
  const router = useRouter();
  const { isAuthenticated, isCustomer, isLoading: authLoading } = useAuth();
  const join = useJoinWaitlist();

  const [serviceId, setServiceId] = useState("");
  const [staffId, setStaffId] = useState("");
  const [dates, setDates] = useState([toDateInput(), "", "", "", ""].slice(0, 1));
  const [instantDiscount, setInstantDiscount] = useState(false);
  const [touched, setTouched] = useState(false);

  // The roster arrives with the public business payload; `GET /staff` is
  // owner-only and would 401 for a signed-out visitor.
  const staff = staffProp;

  const activeServices = services.filter((service) => service.isActive !== false);
  const filledDates = dates.filter(Boolean);

  const setDate = (index, value) =>
    setDates((prev) => prev.map((entry, position) => (position === index ? value : entry)));

  const canSubmit = Boolean(serviceId) && filledDates.length > 0;

  const requireAuth = () => {
    if (authLoading) return false;
    if (!isAuthenticated) {
      router.push("/login?role=customer&next=/dashboard/customer/bookings");
      return false;
    }
    if (!isCustomer) {
      router.push("/dashboard/owner");
      return false;
    }
    return true;
  };

  const submit = async (event) => {
    event.preventDefault();
    setTouched(true);
    if (!canSubmit || !requireAuth()) return;

    try {
      await join.mutateAsync({
        serviceId,
        preferredDates: filledDates,
        ...(staffId ? { preferredStaffId: staffId } : {}),
        ...(instantDiscount ? { isInstantSlotDiscount: true } : {}),
      });
      setServiceId("");
      setStaffId("");
      setDates([toDateInput()]);
      setInstantDiscount(false);
      setTouched(false);
    } catch {
      /* the mutation raises its own toast */
    }
  };

  if (activeServices.length === 0) return null;

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl bg-surface p-5 shadow-card sm:p-6"
      aria-labelledby="waitlist-heading"
    >
      <h2 id="waitlist-heading" className="flex items-center gap-2 text-base font-semibold">
        <Clock size={16} className="text-accent" aria-hidden="true" />
        No slot available?
      </h2>
      <p className="mt-1 mb-5 text-xs leading-relaxed text-muted-foreground">
        Join the waitlist for {business?.businessName ?? "this business"} and it will offer you a slot
        when one frees up.
      </p>

      <div className="space-y-4">
        <div>
          <label htmlFor="waitlist-service" className="label">
            Service
          </label>
          <select
            id="waitlist-service"
            value={serviceId}
            onChange={(event) => {
              setServiceId(event.target.value);
              setStaffId("");
            }}
            className="input"
          >
            <option value="">Choose a service</option>
            {activeServices.map((service) => (
              <option key={idOf(service)} value={idOf(service)}>
                {service.name}
              </option>
            ))}
          </select>
        </div>

        {serviceId && staff.length > 0 && (
          <div>
            <label htmlFor="waitlist-staff" className="label">
              Preferred staff member <span className="font-normal text-muted-foreground">(optional)</span>
            </label>
            <select
              id="waitlist-staff"
              value={staffId}
              onChange={(event) => setStaffId(event.target.value)}
              className="input"
            >
              <option value="">Anyone available</option>
              {staff.map((member) => (
                <option key={idOf(member)} value={idOf(member)}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <fieldset>
          <legend className="label">
            Preferred dates
            <span className="ml-1.5 font-normal text-muted-foreground">
              ({filledDates.length}/{MAX_DATES})
            </span>
          </legend>

          <div className="space-y-2">
            {dates.map((value, index) => (
              <div key={index} className="flex gap-2">
                <label htmlFor={`waitlist-date-${index}`} className="sr-only">
                  Preferred date {index + 1}
                </label>
                <input
                  id={`waitlist-date-${index}`}
                  type="date"
                  value={value}
                  min={toDateInput()}
                  onChange={(event) => setDate(index, event.target.value)}
                  className="input py-2 text-sm"
                />
                {dates.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setDates((prev) => prev.filter((_, position) => position !== index))}
                    className="btn-ghost btn-sm shrink-0 text-muted-foreground"
                    aria-label={`Remove preferred date ${index + 1}`}
                  >
                    <X size={14} aria-hidden="true" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {dates.length < MAX_DATES && (
            <button
              type="button"
              onClick={() => setDates((prev) => [...prev, ""])}
              className="btn-ghost btn-sm mt-1 text-accent"
            >
              <Plus size={13} aria-hidden="true" />
              Add another date
            </button>
          )}

          {touched && filledDates.length === 0 && (
            <p className="mt-1.5 text-xs text-danger">Add at least one preferred date.</p>
          )}
        </fieldset>

        <label className="flex cursor-pointer items-start gap-2.5 rounded-xl bg-muted/60 p-3">
          <input
            type="checkbox"
            checked={instantDiscount}
            onChange={(event) => setInstantDiscount(event.target.checked)}
            className="mt-0.5"
          />
          <span className="text-sm">
            <span className="flex items-center gap-1.5 font-medium">
              <Zap size={13} className="text-warning" aria-hidden="true" />
              I will take any instant slot
            </span>
            <span className="mt-0.5 block text-xs text-muted-foreground">
              Flags you as flexible so the business can offer discounted last-minute slots.
            </span>
          </span>
        </label>
      </div>

      <button
        type="submit"
        disabled={join.isPending}
        className="btn-outline mt-5 w-full"
      >
        {join.isPending && <Loader2 size={15} className="animate-spin" aria-hidden="true" />}
        Join the waitlist
      </button>
    </form>
  );
}
