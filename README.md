# Layan — frontend

Next.js 14 (App Router) frontend for the Layan salon-booking platform. It talks to the
`layan-salon` Express/MongoDB backend and serves four separate role dashboards — customer,
owner, staff and platform admin — alongside the public marketing and discovery pages.

## Requirements

- Node.js 18.17+ (developed on 20/22)
- The `layan-salon` backend running on **:5000** (see its own README for setup)
- A Firebase project for customer sign-in

## Setup

```bash
npm install
cp .env.example .env.local    # then fill in the real values
npm run dev                   # http://localhost:3000
```

The frontend is pinned to **:3000** in the dev/start scripts so the port is always
explicit. Running plain `next dev` would silently bind somewhere else and break the URL
the README and Firebase auth config assume.

### Environment

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_FIREBASE_*` | Firebase Web app config. Public identifiers — safe in a browser bundle |
| `NEXT_PUBLIC_API_BASE_URL` | Backend base, e.g. `http://localhost:5000/api` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_…` for the payment UI |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Used by the image-upload UI |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin for metadata, OG tags and the sitemap |

`.env.local` holds the real Firebase config and **must not be committed**; `.env.example`
is the committed template.

## Demo accounts

Seeded by `node scripts/seed-demo.mjs` in the backend repo. **Password for every account: `12345678`**

| Role | Email | Signs in at | Notes |
|---|---|---|---|
| Platform admin | `admin.layan@gmail.com` | `/login` → Admin | Full platform access. Sees 1 business waiting for approval |
| Business owner | `owner.layan@gmail.com` | `/login` → Owner | Owns **Layan Demo Salon** (approved, 4 services, 1 staff member) |
| Staff | `staff.layan@gmail.com` | `/login` → Staff | **Sam Stylist**, manager level, Mon–Wed 09:00–17:00 |
| Customer | `customer.layan@gmail.com` | `/register` → Customer, or `/login` → Customer | Chris Customer, with a favourite business already set |
| Pending owner | `pending.layan@gmail.com` | `/login` → Owner | Owns **Newcomer Nails**, unapproved — hidden from public search until an admin approves it |

**Customers authenticate with Firebase, not a backend password.** The seed script creates a
real Firebase Auth user for `customer.layan@gmail.com` and links it to a Mongo record via
`users/sync`, so you can sign in normally at `/login`. If Firebase signup is unavailable
(no API key or network), sign up at `/register` on the Customer tab with the same email and
password — the backend links the record on first login.

Re-running the seed is safe: every account is upserted by email.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server on :3000 |
| `npm run build` | Production build |
| `npm run start` | Serve the production build on :3000 |
| `npm run lint` | ESLint via `next lint` |

`npm run build` and `npm run lint` both pass clean. The build reports an
"API unavailable" note on the home page and sitemap when the backend is not running —
that is the intended graceful degradation, not a build failure.

## Architecture

```
src/
  app/
    (public)/    marketing, search and business profiles  — server-rendered for SEO
    (auth)/      login and register
    dashboard/
      customer/  bookings, favourites, wallet, messages, profile
      owner/     overview, business, services, staff, calendar, waitlist,
                 reviews, promotions, messages, analytics
      staff/     today, calendar, profile
      admin/     overview, businesses, users, disputes, fraud, promotions
  components/
    Public/        presentational + shared widgets (BookingWidget, WaitlistJoin, …)
    Dashboard/     per-role feature components
    Auth/          AuthProvider, AuthGuard
  hooks/           one React Query module per backend resource
  lib/             axios instance, endpoint map, constants, utils, serverApi
  scripts/         dev/build helper scripts
```

### Data fetching

- **Client** — `hooks/*` wrap React Query. `lib/axios.js` unwraps the backend's
  `{ success, message, data }` envelope and normalises errors to `{ status, message, body }`,
  so hooks return the payload directly and components can `catch (error) { error.message }`.
- **Server** — `lib/serverApi.js` uses plain `fetch` (the Axios instance has no credentials
  during SSR) with `revalidate: 60`, so public pages stay crawlable without a redeploy.
  It throws `ApiUnavailableError` when the API is unreachable, which pages catch to render a
  "service unavailable" state instead of a 500.

### Auth

Two systems coexist by design:

- **Customers** sign in with Firebase; requests carry `x-firebase-uid`. They are created on
  first login by `POST /api/users/sync`.
- **Owner / staff / admin** sign in against the backend with `Authorization: Bearer <jwt>`.

`components/Auth/AuthProvider.jsx` owns both sessions, and `AuthGuard` enforces the role for
each dashboard segment. There is **no admin registration endpoint** — an admin row must be
inserted into the `admins` collection directly (see the backend README).

## Known gaps

These are backend limitations, surfaced in the UI rather than hidden:

- **No availability endpoint.** The booking widget generates plausible slot times; the
  backend's conflict validation is the real source of truth, and a clash is reported as an error.
- **No monthly analytics series.** `GET /api/admin/analytics` returns flat totals, so the
  admin overview shows share-of-total bars rather than a trend chart. Owner analytics derives
  its monthly series client-side from booking data.
- **No customer thread-list endpoint.** The customer messages view derives which businesses
  to list from their own bookings.
- **No "my reviews" endpoint.** A booking offers a review while it is review-eligible; a second
  attempt is rejected by the API's one-review-per-booking rule.
- **No PaymentIntent route.** The checkout dialog records `amountPaid` and `tip` directly
  against the booking. Card details are never collected by this app.
- **Unverified businesses are invisible in public search** by design, so a brand-new owner's
  listing only appears once an admin approves it.

## Notes for future work

- `data/data.json` in the backend repo is reference-only and is not loaded at runtime.
- Images use Cloudinary URLs when configured; without a cloud name the upload UI degrades to
  a disabled state rather than failing.
