import Link from "next/link";
import { ArrowRight, TrendingUp, Users } from "lucide-react";

const POINTS = [
  { icon: Users, text: "Reach customers already searching for your services in your area" },
  { icon: TrendingUp, text: "A dashboard for bookings, staff, waitlist and promotions" },
];

/** Owner-acquisition banner. Sends visitors to /register?role=owner. */
export default function ListYourBusinessCta() {
  return (
    <section className="container-page py-16 sm:py-20" aria-labelledby="list-your-business">
      <div className="overflow-hidden rounded-3xl bg-primary px-6 py-12 text-primary-foreground sm:px-12 sm:py-16">
        <div className="max-w-2xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-accent-light">
            For salons &amp; barbers
          </p>
          <h2 id="list-your-business" className="text-3xl text-primary-foreground sm:text-4xl">
            Fill your diary without chasing bookings
          </h2>
          <p className="mt-4 text-base leading-relaxed text-primary-foreground/75">
            List your business on Layan, publish your services and let customers book the slots you actually
            have free. You stay in control of your calendar, your staff and your prices.
          </p>

          <ul className="mt-6 space-y-2.5">
            {POINTS.map((point) => (
              <li key={point.text} className="flex items-start gap-2.5 text-sm text-primary-foreground/85">
                <point.icon size={17} className="mt-0.5 shrink-0 text-accent-light" aria-hidden="true" />
                {point.text}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/register?role=owner"
              className="btn bg-accent px-6 text-white hover:bg-accent/90"
            >
              List your business
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link
              href="/how-it-works"
              className="btn border border-primary-foreground/25 text-primary-foreground hover:bg-primary-foreground/10"
            >
              How it works
            </Link>
          </div>

          <p className="mt-5 text-xs text-primary-foreground/55">
            New businesses are reviewed by our team before they appear in search.
          </p>
        </div>
      </div>
    </section>
  );
}
