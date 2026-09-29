/**
 * Every backend path as a named constant or function.
 *
 * Single source of truth: hooks import from here and nothing else hardcodes a
 * URL. Base URL comes from NEXT_PUBLIC_API_BASE_URL (the layan-salon Express
 * server, which runs on port 5000).
 */

const BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api").replace(
  /\/$/,
  ""
);

/** Builds a query string, dropping empty / undefined values. */
export function qs(params = {}) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    if (Array.isArray(value)) {
      if (value.length === 0) continue;
      search.set(key, value.join(","));
    } else {
      search.set(key, String(value));
    }
  }
  const str = search.toString();
  return str ? `?${str}` : "";
}

export const API = {
  // ---- auth (owner / staff / admin) ----
  registerOwner: `${BASE}/auth/register/owner`,
  login: `${BASE}/auth/login`,
  me: `${BASE}/auth/me`,

  // ---- users (customer, Firebase) ----
  userSync: `${BASE}/users/sync`,
  userMe: `${BASE}/users/me`,
  userMeFavourites: `${BASE}/users/me/favourites`,
  users: (params) => `${BASE}/users${qs(params)}`,

  // ---- businesses ----
  businesses: (params) => `${BASE}/businesses${qs(params)}`,
  businessMe: `${BASE}/businesses/me`,
  businessesPending: `${BASE}/businesses/pending`,
  businessById: (id) => `${BASE}/businesses/${id}`,
  businessVerify: (id) => `${BASE}/businesses/${id}/verify`,

  // ---- services ----
  services: (params) => `${BASE}/services${qs(params)}`,
  serviceById: (id) => `${BASE}/services/${id}`,

  // ---- staff ----
  staff: `${BASE}/staff`,
  staffById: (id) => `${BASE}/staff/${id}`,

  // ---- bookings ----
  bookings: (params) => `${BASE}/bookings${qs(params)}`,
  bookingById: (id) => `${BASE}/bookings/${id}`,
  bookingStatus: (id) => `${BASE}/bookings/${id}/status`,
  bookingCheckout: (id) => `${BASE}/bookings/${id}/checkout`,

  // ---- waitlist ----
  waitlist: (params) => `${BASE}/waitlist${qs(params)}`,
  waitlistById: (id) => `${BASE}/waitlist/${id}`,

  // ---- reviews ----
  reviews: (params) => `${BASE}/reviews${qs(params)}`,
  reviewReply: (id) => `${BASE}/reviews/${id}/reply`,

  // ---- wallet ----
  walletMe: `${BASE}/wallet/me`,
  walletTopup: `${BASE}/wallet/me/topup`,
  walletRedeem: `${BASE}/wallet/me/redeem`,
  walletTransactions: (params) => `${BASE}/wallet/me/transactions${qs(params)}`,

  // ---- messages ----
  messages: (params) => `${BASE}/messages${qs(params)}`,
  messageThreads: `${BASE}/messages/threads`,

  // ---- promotions ----
  promotions: (params) => `${BASE}/promotions${qs(params)}`,
  promotionById: (id) => `${BASE}/promotions/${id}`,

  // ---- admin ----
  adminAnalytics: `${BASE}/admin/analytics`,
  adminFraudFlags: `${BASE}/admin/fraud-flags`,
  adminDisputes: (params) => `${BASE}/admin/disputes${qs(params)}`,
  adminDisputeById: (id) => `${BASE}/admin/disputes/${id}`,

  // ---- uploads (see note in README: not yet implemented server-side) ----
  uploads: `${BASE}/uploads`,
};

export default API;
