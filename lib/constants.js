/**
 * Shared, framework-free constants.
 *
 * These live outside any "use client" module on purpose: in the App Router every
 * export of a client module becomes a client-reference proxy, so a server
 * component that imports a plain array from a client file and calls `.map()` on it
 * fails at render with "Attempted to call map() from the server but map is on the
 * client".
 */

export const CATEGORIES = [
  "Hair Salon",
  "Barber",
  "Nail Bar",
  "Beauty Salon",
  "Spa & Wellness",
  "Makeup",
  "Brow & Lash",
  "Massage",
];

export const SORT_OPTIONS = [
  { id: "newest", label: "Newest first" },
  { id: "score", label: "Top rated" },
];

export const BOOKING_STATUSES = [
  "pending",
  "confirmed",
  "attended",
  "cancelled",
  "late_cancel",
  "no_show",
];

export const VERIFICATION_STATUSES = ["pending", "approved", "rejected"];

export const WAITLIST_STATUSES = ["waiting", "notified", "booked", "expired"];

export const DISPUTE_STATUSES = ["open", "under_review", "resolved", "rejected"];

export const PAYMENT_METHODS = [
  "wallet",
  "card",
  "apple_pay",
  "google_pay",
  "gift_card",
  "loyalty_points",
  "package_session",
];

export const STAFF_PERMISSION_LEVELS = ["view_only", "standard", "manager"];

export const PROMOTION_TYPES = [
  "happy_hour",
  "last_minute_deal",
  "new_customer",
  "returning_customer",
  "birthday",
  "flash_sale",
  "quiet_day",
];

export const WALLET_CREDIT_TYPES = ["loyalty_earn", "referral_credit", "gift_card_topup"];

export const WALLET_DEBIT_TYPES = ["loyalty_redeem", "gift_card_redeem"];

export const GENDER_PREFERENCES = ["male", "female", "no_preference"];

/** Home-page hero quick links. */
export const POPULAR_QUICK_LINKS = CATEGORIES.slice(0, 4);
