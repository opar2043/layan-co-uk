"use client";

import { useState } from "react";
import { X, Loader2, CreditCard, Wallet } from "lucide-react";
import { useCheckoutBooking } from "@/hooks/useBookings";
import { formatCurrency, idOf, toNumber } from "@/lib/utils";
import { PAYMENT_METHODS } from "@/lib/constants";

/**
 * Settle a booking at the salon.
 *
 * `PATCH /bookings/:id/checkout` accepts `{ amountPaid, tip, paymentMethod }`.
 * When `amountPaid` is omitted the backend defaults it to `totalPrice`, so the
 * pre-filled value here is the booking total.
 */
export default function CheckoutModal({ booking, onClose, onDone }) {
  const checkout = useCheckoutBooking();

  const [amount, setAmount] = useState(String(booking?.totalPrice ?? 0));
  const [tip, setTip] = useState("0");
  const [method, setMethod] = useState(booking?.paymentMethod ?? "card");

  const bookingId = idOf(booking);
  const total = booking?.totalPrice ?? 0;
  const alreadyPaid = Number(booking?.amountPaid ?? 0);
  const amountValue = Number.isNaN(toNumber(amount)) ? 0 : toNumber(amount);
  const tipValue = Number.isNaN(toNumber(tip)) ? 0 : toNumber(tip);
  const outstanding = Math.max(0, amountValue - alreadyPaid);

  const submit = async (event) => {
    event.preventDefault();
    try {
      const result = await checkout.mutateAsync({
        id: bookingId,
        amountPaid: amountValue,
        tip: tipValue,
        paymentMethod: method,
      });
      onDone?.(result);
      onClose();
    } catch {
      /* the mutation raises its own toast */
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label="Checkout">
      <div className="absolute inset-0 bg-primary/40 backdrop-blur-sm" onClick={onClose} />

      <form
        onSubmit={submit}
        className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-surface p-6 shadow-pop sm:rounded-3xl"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg">Take payment</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {booking?.service?.name ?? "Appointment"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
            aria-label="Close checkout"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <dl className="mb-5 space-y-2 rounded-xl bg-muted/60 p-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Booking total</dt>
            <dd className="font-semibold">{formatCurrency(total, { pence: true })}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Already paid</dt>
            <dd className="font-semibold">{formatCurrency(alreadyPaid, { pence: true })}</dd>
          </div>
          {tipValue > 0 && (
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Tip</dt>
              <dd className="font-semibold text-success">{formatCurrency(tipValue, { pence: true })}</dd>
            </div>
          )}
          <div className="flex justify-between border-t border-border pt-2">
            <dt className="font-semibold">Total to take</dt>
            <dd className="text-lg font-bold text-accent">
              {formatCurrency(amountValue + tipValue, { pence: true })}
            </dd>
          </div>
        </dl>

        <div className="space-y-4">
          <div>
            <label htmlFor="checkout-amount" className="label">
              Amount received
            </label>
            <input
              id="checkout-amount"
              type="number"
              min="0"
              step="0.01"
              required
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="input tabular-nums"
            />
            {outstanding > 0 && (
              <p className="hint mt-1.5">
                {formatCurrency(outstanding, { pence: true })} outstanding on this booking.
              </p>
            )}
          </div>

          <div>
            <label htmlFor="checkout-tip" className="label">
              Tip
            </label>
            <div className="flex gap-2">
              <input
                id="checkout-tip"
                type="number"
                min="0"
                step="0.01"
                value={tip}
                onChange={(event) => setTip(event.target.value)}
                className="input tabular-nums"
              />
              {[0, 0.1, 0.15, 0.2].map((percent) => (
                <button
                  key={percent}
                  type="button"
                  onClick={() => setTip((total * percent).toFixed(2))}
                  className="btn-outline btn-sm shrink-0"
                >
                  {percent === 0 ? "None" : `${percent * 100}%`}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="checkout-method" className="label">
              Payment method
            </label>
            <select
              id="checkout-method"
              value={method}
              onChange={(event) => setMethod(event.target.value)}
              className="input"
            >
              {PAYMENT_METHODS.map((option) => (
                <option key={option} value={option}>
                  {option.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                </option>
              ))}
            </select>
            <p className="hint mt-1.5">
              Recorded against the booking ledger. Card capture runs through the payment endpoint once it is
              live.
            </p>
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          <button type="button" onClick={onClose} className="btn-outline flex-1">
            Cancel
          </button>
          <button type="submit" disabled={checkout.isPending} className="btn-accent flex-1">
            {checkout.isPending ? (
              <Loader2 size={15} className="animate-spin" aria-hidden="true" />
            ) : method === "wallet" ? (
              <Wallet size={15} aria-hidden="true" />
            ) : (
              <CreditCard size={15} aria-hidden="true" />
            )}
            Record {formatCurrency(amountValue + tipValue, { pence: true })}
          </button>
        </div>
      </form>
    </div>
  );
}
