import { serverListBusinesses } from "@/lib/serverApi";

const SITE = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

const STATIC_ROUTES = [
  { path: "", priority: 1, changeFrequency: "daily" },
  { path: "/search", priority: 0.9, changeFrequency: "daily" },
  { path: "/how-it-works", priority: 0.6, changeFrequency: "monthly" },
  { path: "/about", priority: 0.5, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.5, changeFrequency: "monthly" },
  { path: "/faq", priority: 0.5, changeFrequency: "monthly" },
  { path: "/list-your-business", priority: 0.8, changeFrequency: "monthly" },
  { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
];

/**
 * Dynamic sitemap.
 *
 * Every verified business is discovered live from `GET /businesses`, so newly
 * approved listings get indexed without a redeploy. Auth-only and dashboard
 * routes are deliberately absent.
 */
export default async function sitemap() {
  const now = new Date();

  const staticEntries = STATIC_ROUTES.map((route) => ({
    url: `${SITE}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  let businessEntries = [];
  try {
    // limit=100 is the practical ceiling for one public request; enough for a
    // launch-sized directory without paging.
    const result = await serverListBusinesses({ limit: 100, sort: "score" });
    const items = result?.items ?? [];
    businessEntries = items
      .filter((business) => business.isBusinessVerified !== false && business._id)
      .map((business) => ({
        url: `${SITE}/businesses/${business._id}`,
        lastModified: new Date(business.updatedAt ?? business.createdAt ?? now),
        changeFrequency: "weekly",
        priority: 0.8,
      }));
  } catch (error) {
    // A dead backend must not break /sitemap.xml — emit the static routes only.
    console.warn("[sitemap] business URLs unavailable:", error.message);
  }

  return [...staticEntries, ...businessEntries];
}
