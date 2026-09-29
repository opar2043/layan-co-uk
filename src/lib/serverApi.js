import "server-only";

/**
 * Server-side fetch for the App Router.
 *
 * The browser Axios instance attaches credentials from module state, which does
 * not exist during SSR — this uses plain `fetch` instead. Only ever called for
 * public, unauthenticated endpoints (business profiles, the search feed).
 *
 * `revalidate` keeps these crawlable without turning them fully static, so a newly
 * verified business shows up in search and the sitemap without a redeploy.
 */

const BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api").replace(/\/$/, "");

export class ApiUnavailableError extends Error {
  constructor(cause) {
    super(
      `Could not reach the Layan API at ${BASE}. Start the backend with \`npm run dev\` in layan-salon.`
    );
    this.name = "ApiUnavailableError";
    this.cause = cause;
  }
}

/**
 * Calls a public endpoint and unwraps `{ success, data }`.
 * Returns `fallback` instead of throwing when `tolerateFailure` is set, so a
 * single dead endpoint cannot take down a whole page.
 */
export async function serverGet(path, { revalidate = 60, tolerateFailure = false, fallback = null } = {}) {
  try {
    const response = await fetch(`${BASE}${path}`, {
      headers: { Accept: "application/json" },
      next: { revalidate },
    });

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      throw new Error(body?.message || `API returned ${response.status}`);
    }

    const body = await response.json();
    return body?.data ?? null;
  } catch (error) {
    if (error instanceof ApiUnavailableError) throw error;
    if (tolerateFailure) {
      console.warn(`[serverApi] ${path} failed: ${error.message}`);
      return fallback;
    }
    throw new ApiUnavailableError(error);
  }
}

/** `GET /businesses` — the verified-business feed. */
export function serverListBusinesses(params = {}) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    search.set(key, String(value));
  }
  const query = search.toString();
  return serverGet(`/businesses${query ? `?${query}` : ""}`);
}

/** `GET /businesses/:id` — includes the business's live services. */
export function serverGetBusiness(id) {
  return serverGet(`/businesses/${id}`);
}

/** `GET /reviews?businessId=` — newest first. */
export function serverListReviews(businessId, params = {}, options = {}) {
  const search = new URLSearchParams({ businessId, ...params });
  return serverGet(`/reviews?${search.toString()}`, options);
}
