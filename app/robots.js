/**
 * robots.txt
 *
 * Public discovery is fully crawlable. Everything under /dashboard and the auth
 * routes are excluded — they are per-user and worthless in an index.
 */
export default function robots() {
  const site = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/dashboard/", "/api/", "/login", "/register"],
      },
    ],
    sitemap: `${site}/sitemap.xml`,
    host: site,
  };
}
