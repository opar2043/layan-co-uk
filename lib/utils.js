/** Formatting + small shared helpers. No React in here. */

// ---- currency ----
const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const gbpPence = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  minimumFractionDigits: 2,
});

export function formatCurrency(value, { pence = false } = {}) {
  const amount = Number(value ?? 0);
  if (Number.isNaN(amount)) return "£0";
  return pence || !Number.isInteger(amount) ? gbpPence.format(amount) : gbp.format(amount);
}

// ---- dates ----
const dateFmt = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
});
const dateTimeFmt = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});
const longDateFmt = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function toDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatDate(value) {
  const d = toDate(value);
  return d ? dateFmt.format(d) : "—";
}

export function formatDateTime(value) {
  const d = toDate(value);
  return d ? dateTimeFmt.format(d) : "—";
}

export function formatLongDate(value) {
  const d = toDate(value);
  return d ? longDateFmt.format(d) : "—";
}

export function formatTime(value) {
  const d = toDate(value);
  if (!d) return "—";
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function formatMonthLabel(value) {
  const d = toDate(value);
  if (!d) return "—";
  return new Intl.DateTimeFormat("en-GB", { month: "short", year: "2-digit" }).format(d);
}

export function timeAgo(value) {
  const d = toDate(value);
  if (!d) return "—";
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return dateFmt.format(d);
}

export function isFuture(value) {
  const d = toDate(value);
  return d ? d.getTime() > Date.now() : false;
}

export function durationMinutes(start, end) {
  const a = toDate(start);
  const b = toDate(end);
  if (!a || !b) return 0;
  return Math.round((b.getTime() - a.getTime()) / 60000);
}

/** `yyyy-mm-dd` in local time — `toISOString` would shift the day across timezones. */
export function toDateInput(value) {
  const d = toDate(value) ?? new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Combines a `yyyy-mm-dd` value with an `HH:mm` value into an ISO string. */
export function combineDateTime(dateStr, timeStr) {
  if (!dateStr || !timeStr) return null;
  const d = new Date(`${dateStr}T${timeStr}:00`);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function startOfDay(date) {
  const d = toDate(date) ?? new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(date) {
  const d = toDate(date) ?? new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

// ---- text ----
export function initials(name) {
  if (!name) return "?";
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function truncate(text, length = 120) {
  if (!text) return "";
  return text.length > length ? `${text.slice(0, length - 1).trimEnd()}…` : text;
}

export function titleCase(value) {
  if (!value) return "";
  return String(value)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function pluralise(count, singular, plural) {
  return `${count} ${count === 1 ? singular : plural ?? `${singular}s`}`;
}

export function classNames(...values) {
  return values.filter(Boolean).join(" ");
}

// ---- ids ----
/** Mongo ObjectId as it arrives from the API. */
export function idOf(entity) {
  if (!entity) return null;
  return entity._id ?? entity.id ?? null;
}

/** Renders a populated reference as its human label, whichever it is. */
export function refName(ref) {
  if (!ref) return null;
  if (typeof ref === "string") return ref;
  return ref.name ?? ref.businessName ?? ref.title ?? ref.fullName ?? null;
}

// ---- charts ----
/**
 * Buckets bookings into the last `months` calendar months by revenue.
 *
 * The backend's admin analytics returns a flat revenue total, not a monthly
 * series, so the dashboards derive the trend client-side from the booking list
 * they already have. See README "Known gaps".
 */
export function monthlyRevenue(bookings = [], months = 6) {
  const now = new Date();
  const buckets = new Map();

  for (let i = months - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.set(`${d.getFullYear()}-${d.getMonth()}`, {
      month: formatMonthLabel(d),
      revenue: 0,
      bookings: 0,
    });
  }

  for (const booking of bookings) {
    const d = toDate(booking.startTime);
    if (!d) continue;
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const bucket = buckets.get(key);
    if (!bucket) continue;
    bucket.revenue += Number(booking.amountPaid ?? 0);
    bucket.bookings += 1;
  }

  return [...buckets.values()];
}

// ---- validation ----
export function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(value ?? "").trim());
}

export function isHexColor(value) {
  return /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(String(value ?? "").trim());
}

/** Coerces "" / null / undefined into a clean number, or NaN for invalid input. */
export function toNumber(value) {
  if (value === "" || value === null || value === undefined) return NaN;
  return Number(value);
}

export function cx(...values) {
  return classNames(...values);
}
