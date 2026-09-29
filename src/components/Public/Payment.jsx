"use client";

import { useMemo, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { CreditCard, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useCheckoutBooking } from "@/hooks/useBookings";
import { formatCurrency, idOf } from "@/lib/utils";

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = publishableKey && publishableKey.startsWith("pk_")
  ? loadStripe(publishableKey)
  : null;

/**
 * Not-configured state.
 *
 * The backend does not yet expose `POST /bookings/:id/create-payment-intent`, so
 * `Elements` cannot be given a clientSecret and Stripe Elements will not mount.
 * Rather than rendering a form that silently fails on submit, this says exactly
 * what is missing and offers the route that does work.
 */
function NotConfigured({ reason, fallback }) {
  return (
    <div className="rounded-2xl border border-warning/30 bg-warning/5 p-5">
      <p className="flex items-center gap-2 text-sm font-semibold text-warning">
        <AlertTriangle size={16} aria-hidden="true" />
        Card payments are not available yet
      </p>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{reason}</p>
      {fallback && <div className="mt-4">{fallback}</div>}
    </div>
  );
}

function CardForm({ booking, onPaid, onCancel }) {
  const stripe = useStripe();
  const elements = useElements();
  const checkout = useCheckoutBooking();
  const [busy, setBusy] = useState(false);

  const bookingId = idOf(booking);
  const due = Math.max(0, Number(booking?.amountPaid ?? 0));

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setBusy(true);
    try {
      // Step 1 would be POST /bookings/:id/create-payment-intent -> { clientSecret }.
      // That route is not implemented server-side yet, so this is where the flow
      // would confirm the card. Until then the booking is settled with the
      // documented `paymentMethod: "card"` call so staff can still record it.
      const card = elements.getElement(CardElement);
      await stripe.createPaymentMethod({ type: "card", card });

      const result = await checkout.mutateAsync({
        id: bookingId,
        amountPaid: due,
        paymentMethod: "card",
      });
      onPaid?.(result);
    } catch {
      /* checkout raises its own toast */
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-xl border border-border bg-surface p-4">
        <label className="label" htmlFor="card-element">
          Card details
        </label>
        <div id="card-element" className="py-2">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "15px",
                  color: "#1F1B16",
                  fontFamily: "Inter, system-ui, sans-serif",
                  "::placeholder": { color: "#6B6459" },
                },
                invalid: { color: "#C24F4F" },
              },
            }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Amount to record</span>
        <span className="text-lg font-semibold text-accent">{formatCurrency(due, { pence: true })}</span>
      </div>

      <div className="flex gap-2">
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-outline flex-1">
            Cancel
          </button>
        )}
        <button type="submit" disabled={busy || !stripe} className="btn-accent flex-1">
          {busy ? (
            <>
              <Loader2 size={15} className="animate-spin" aria-hidden="true" />
              Processing…
            </>
          ) : (
            <>
              <CreditCard size={15} aria-hidden="true" />
              Pay {formatCurrency(due, { pence: true })}
            </>
          )}
        </button>
      </div>
    </form>
  );
}

/**
 * Booking deposit checkout.
 *
 * Needs an `elements` prop carrying `{ clientSecret }`, obtained from the (not yet
 * implemented) payment-intent route. While that is unavailable the component
 * explains itself and offers the wallet / settle-at-visit alternatives that the
 * backend does support.
 */
export default function Payment({ booking, elements, onPaid, onCancel, fallback }) {
  const options = useMemo(
    () => (elements?.clientSecret ? { clientSecret: elements.clientSecret } : null),
    [elements]
  );

  if (!stripePromise) {
    return (
      <NotConfigured
        reason={
          publishableKey
            ? "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is set to a placeholder value. Add a real pk_test_… key to enable Stripe Elements."
            : "No Stripe publishable key is configured in .env.local."
        }
        fallback={fallback}
      />
    );
  }

  if (!options) {
    return (
      <NotConfigured
        reason="The backend route POST /api/bookings/:id/create-payment-intent has not been implemented yet, so Stripe cannot collect a card deposit at booking time. Your booking is safe — the business records the balance at checkout."
        fallback={fallback}
      />
    );
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      <CardForm booking={booking} onPaid={onPaid} onCancel={onCancel} />
    </Elements>
  );
}

export { NotConfigured };
