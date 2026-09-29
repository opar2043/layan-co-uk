"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, User, Check, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useCreateBooking } from "@/hooks/useBookings";
import useAuth from "@/components/Auth/useAuth";
import AvailabilityCalendar from "./AvailabilityCalendar";
import EmptyState from "./EmptyState";
import { combineDateTime, formatCurrency, idOf, toDateInput, classNames } from "@/lib/utils";

/** 30-minute grid from 09:00 to 18:00. Slot clashes are validated server-side. */
const SLOT_TIMES = Array.from({ length: 19 }, (_, index) => {
  const total = 9 * 60 + index * 30;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
});

function Stepper({ step }) {
  const steps = ["Service", "Time", "Confirm"];
  return (
    <ol className="mb-6 flex items-center gap-2" aria-label="Booking steps">
      {steps.map((label, index) => {
        const number = index + 1;
        const state = step > number ? "done" : step === number ? "current" : "todo";
        return (
          <li key={label} className="flex flex-1 items-center gap-2">
            <span
              className={classNames(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition-colors",
                state === "todo" && "bg-muted text-muted-foreground",
                state === "current" && "bg-accent text-white",
                state === "done" && "bg-success text-white"
              )}
              aria-current={state === "current" ? "step" : undefined}
            >
              {state === "done" ? <Check size={12} aria-hidden="true" /> : number}
            </span>
            <span
              className={classNames(
                "hidden text-xs font-medium sm:inline",
                state === "current" ? "text-primary" : "text-muted-foreground"
              )}
            >
              {label}
            </span>
            {number < steps.length && (
              <span
                className={classNames("h-px flex-1", step > number ? "bg-success" : "bg-border")}
                aria-hidden="true"
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

/**
 * Service → time → confirm booking widget.
 *
 * The backend derives `businessId` from the chosen service, so this form only
 * ever sends `serviceId`, `staffId`, `startTime` and optionally `depositAmount` /
 * `paymentMethod`. Sending a businessId would be ignored at best.
 */
export default function BookingWidget({ business, services = [], staff: staffProp = [], onBooked }) {
  const router = useRouter();
  const { isAuthenticated, isCustomer, isLoading: authLoading } = useAuth();
  const createBooking = useCreateBooking();

  const [step, setStep] = useState(1);
  const [serviceId, setServiceId] = useState(null);
  const [staffId, setStaffId] = useState("");
  const [date, setDate] = useState(toDateInput());
  const [time, setTime] = useState("");
  const [deposit, setDeposit] = useState("");

  // `GET /staff` is owner-only, so the roster comes from the public business
  // payload instead — a signed-out visitor can book without a JWT.
  const staff = staffProp;

  const activeServices = useMemo(
    () => services.filter((service) => service.isActive !== false),
    [services]
  );

  const selected = activeServices.find((service) => idOf(service) === serviceId) ?? null;

  const submit = async () => {
    const startTime = combineDateTime(date, time);
    if (!startTime) {
      toast.error("Pick a date and a time slot");
      return;
    }
    const payload = {
      serviceId,
      startTime,
      ...(staffId ? { staffId } : {}),
      ...(deposit !== "" ? { depositAmount: Number(deposit) } : {}),
    };
    try {
      const result = await createBooking.mutateAsync(payload);
      setStep(1);
      setServiceId(null);
      setStaffId("");
      setTime("");
      setDeposit("");
      onBooked?.(result);
    } catch {
      /* the mutation raises its own toast */
    }
  };

  if (activeServices.length === 0) {
    return (
      <EmptyState
        compact
        icon={Clock}
        title="No bookable services yet"
        description="This business has not published any services, so online booking is unavailable."
      />
    );
  }

  const requireAuth = () => {
    if (authLoading) return false;
    if (!isAuthenticated) {
      router.push("/login?role=customer&next=/dashboard/customer/bookings");
      return false;
    }
    if (!isCustomer) {
      toast("Switch to the Customer tab to book an appointment.");
      return false;
    }
    return true;
  };

  return (
    <div className="rounded-2xl bg-surface p-5 shadow-card sm:p-6">
      <Stepper step={step} />

      {step === 1 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold">Choose a service</h3>
          <ul className="max-h-80 space-y-2 overflow-y-auto pr-1">
            {activeServices.map((service) => {
              const id = idOf(service);
              const active = id === serviceId;
              return (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => {
                      setServiceId(id);
                      setStep(2);
                    }}
                    className={classNames(
                      "flex w-full items-center justify-between gap-4 rounded-xl border px-4 py-3 text-left transition-colors",
                      active ? "border-accent bg-accent-light" : "border-border hover:border-accent"
                    )}
                    aria-pressed={active}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">{service.name}</span>
                      <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                        {service.durationMinutes} min
                        {service.description ? ` · ${service.description}` : ""}
                      </span>
                    </span>
                    <span className="shrink-0 text-sm font-semibold text-accent">
                      {formatCurrency(service.price)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div>
            <label htmlFor="booking-staff" className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <User size={15} className="text-accent" aria-hidden="true" />
              Staff member
            </label>
            <select
              id="booking-staff"
              value={staffId}
              onChange={(event) => setStaffId(event.target.value)}
              className="input"
            >
              <option value="">Any available staff member</option>
              {staff.map((member) => (
                <option key={idOf(member)} value={idOf(member)}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>

          <AvailabilityCalendar value={date} onChange={setDate} />

          <div>
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <Clock size={15} className="text-accent" aria-hidden="true" />
              Pick a time
            </p>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {SLOT_TIMES.map((slot) => {
                const active = slot === time;
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setTime(slot)}
                    aria-pressed={active}
                    className={classNames(
                      "rounded-xl border px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "border-accent bg-accent text-white"
                        : "border-border bg-surface hover:border-accent hover:text-accent"
                    )}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-2">
            <button type="button" onClick={() => setStep(1)} className="btn-outline flex-1">
              Back
            </button>
            <button
              type="button"
              onClick={() => (time ? setStep(3) : toast.error("Pick a time slot first"))}
              className="btn-primary flex-1"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-5">
          <dl className="space-y-2.5 rounded-xl bg-muted/60 p-4 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Business</dt>
              <dd className="text-right font-medium">{business?.businessName}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Service</dt>
              <dd className="text-right font-medium">{selected?.name}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">When</dt>
              <dd className="text-right font-medium">
                {new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short" }).format(
                  new Date(`${date}T00:00:00`)
                )}{" "}
                at {time}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Staff</dt>
              <dd className="text-right font-medium">
                {staffId ? staff.find((m) => idOf(m) === staffId)?.name ?? "Selected" : "Any available"}
              </dd>
            </div>
            <div className="flex justify-between gap-4 border-t border-border pt-2.5">
              <dt className="font-semibold">Total</dt>
              <dd className="text-right font-semibold text-accent">
                {formatCurrency(selected?.price ?? 0)}
              </dd>
            </div>
          </dl>

          <div>
            <label htmlFor="booking-deposit" className="label">
              Deposit to pay now <span className="font-normal text-muted-foreground">(optional)</span>
            </label>
            <input
              id="booking-deposit"
              type="number"
              min="0"
              step="1"
              value={deposit}
              onChange={(event) => setDeposit(event.target.value)}
              placeholder="0"
              className="input"
            />
            <p className="hint mt-1.5">
              Card deposits are reconciled by the business at checkout — see the note in the README about
              the payment endpoint.
            </p>
          </div>

          <div className="flex gap-2">
            <button type="button" onClick={() => setStep(2)} className="btn-outline flex-1">
              Back
            </button>
            <button
              type="button"
              onClick={() => requireAuth() && submit()}
              disabled={createBooking.isPending}
              className="btn-accent flex-1"
            >
              {createBooking.isPending ? (
                <>
                  <Loader2 size={15} className="animate-spin" aria-hidden="true" />
                  Booking…
                </>
              ) : (
                "Confirm booking"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
