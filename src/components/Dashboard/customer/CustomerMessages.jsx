"use client";

import { useMemo, useState } from "react";
import { useBookings } from "@/hooks/useBookings";
import MessageThread from "@/components/Dashboard/MessagesInbox";
import { idOf } from "@/lib/utils";

/**
 * Customer inbox.
 *
 * A customer has no inbox endpoint of their own — the backend only exposes
 * `GET /messages/threads` to owner/staff — so the list of businesses they have
 * messaged is derived from their own bookings. That is honest: every thread a
 * customer can have started with a business they booked.
 */
export default function CustomerMessages() {
  const [selectedBusinessId, setSelectedBusinessId] = useState("");

  // The API scopes GET /bookings to the signed-in customer, so this is every
  // business they have ever booked with.
  const { data: bookingData, isLoading } = useBookings({ page: 1, limit: 50 });
  const bookings = useMemo(() => bookingData?.items ?? [], [bookingData]);

  // Deduplicate businesses across the customer's bookings, most recent first.
  const businesses = useMemo(() => {
    const seen = new Map();
    for (const booking of bookings ?? []) {
      const business = booking.business;
      const businessId = idOf(business);
      if (!businessId || seen.has(businessId)) continue;
      seen.set(businessId, {
        id: businessId,
        name: business.businessName ?? "Business",
        latest: new Date(booking.startTime).getTime(),
      });
    }
    return [...seen.values()].sort((a, b) => b.latest - a.latest);
  }, [bookings]);

  const active = selectedBusinessId || businesses[0]?.id || "";
  const activeName = businesses.find((business) => business.id === active)?.name ?? "this business";

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl sm:text-3xl">Messages</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Talk to any business you have booked with.
        </p>
      </header>

      {isLoading ? (
        <div className="skeleton h-64 w-full rounded-2xl" aria-busy="true" />
      ) : businesses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface/50 px-6 py-14 text-center">
          <h2 className="text-base font-semibold">No conversations yet</h2>
          <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">
            Book an appointment and the salon will appear here so you can message them directly.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
          <aside className="rounded-2xl bg-surface p-2 shadow-card" aria-label="Conversations">
            <ul className="space-y-1">
              {businesses.map((business) => (
                <li key={business.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedBusinessId(business.id)}
                    aria-current={business.id === active ? "true" : undefined}
                    className={`w-full truncate rounded-xl px-3.5 py-3 text-left text-sm font-medium transition-colors ${
                      business.id === active ? "bg-accent-light text-accent" : "hover:bg-muted"
                    }`}
                  >
                    {business.name}
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          <MessageThread
            businessId={active}
            emptyTitle={activeName}
            emptyDescription={`No messages yet with ${activeName}. Send the first one below.`}
          />
        </div>
      )}
    </div>
  );
}
