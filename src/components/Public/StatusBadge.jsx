"use client";

import { classNames, titleCase } from "@/lib/utils";

/**
 * Colour-coded status pill.
 *
 * The tone map is keyed by the backend's actual enum values, not friendly names,
 * so a status the UI has never seen still renders a readable label rather than
 * falling through to a blank chip.
 */
const TONES = {
  // BookingStatus
  pending: "warning",
  confirmed: "accent",
  attended: "success",
  cancelled: "muted",
  late_cancel: "danger",
  no_show: "danger",

  // VerificationStatus / generic
  approved: "success",
  rejected: "danger",
  open: "warning",
  under_review: "accent",
  resolved: "success",

  // WaitlistStatus
  waiting: "warning",
  notified: "accent",
  booked: "success",
  expired: "muted",

  // PaymentMethod
  wallet: "accent",
  card: "accent",
  apple_pay: "accent",
  google_pay: "accent",
  gift_card: "accent",
  loyalty_points: "accent",
  package_session: "accent",

  // StaffPermissionLevel
  view_only: "muted",
  standard: "accent",
  manager: "accent",

  // PromotionType
  happy_hour: "accent",
  last_minute_deal: "danger",
  new_customer: "success",
  returning_customer: "accent",
  birthday: "accent",
  flash_sale: "danger",
  quiet_day: "muted",

  // PromotionCreatedBy
  owner: "accent",
  admin: "muted",

  // GenderPreference
  male: "muted",
  female: "accent",
  no_preference: "muted",

  // WalletTransactionType
  loyalty_earn: "success",
  loyalty_redeem: "warning",
  gift_card_topup: "success",
  gift_card_redeem: "warning",
  referral_credit: "success",
  package_purchase: "accent",
  package_use: "accent",

  active: "success",
  inactive: "muted",
  paused: "warning",
};

const STYLES = {
  success: "bg-success/10 text-success ring-success/20",
  warning: "bg-warning/10 text-warning ring-warning/20",
  danger: "bg-danger/10 text-danger ring-danger/20",
  accent: "bg-accent-light text-accent ring-accent/20",
  muted: "bg-muted text-muted-foreground ring-border",
};

export default function StatusBadge({ status, label, size = "sm", className }) {
  if (!status) return null;
  const tone = TONES[status] ?? "muted";
  return (
    <span
      className={classNames(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full font-medium ring-1 ring-inset",
        size === "sm" ? "px-2.5 py-0.5 text-[11px]" : "px-3 py-1 text-xs",
        STYLES[tone],
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {label ?? titleCase(status)}
    </span>
  );
}

export { TONES };
