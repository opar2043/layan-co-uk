import PageHeader from "@/components/Public/PageHeader";
import ListYourBusinessCta from "@/components/Layout/ListYourBusinessCta";
import { Check, X } from "lucide-react";

export const metadata = {
  title: "List your salon, barber or nail bar",
  description:
    "Put your business on Layan and take bookings directly from your own dashboard. Free during the beta, reviewed before you go live.",
  alternates: { canonical: "/list-your-business" },
};

const INCLUDED = [
  "Unlimited service listings with your own prices and durations",
  "A team roster so customers can pick a specific stylist",
  "Day and week booking board with checkout on the spot",
  "A waitlist that fills the slots you cannot sell",
  "Verified reviews and a public Layan Business Score",
  "Promotions for quiet days, happy hours and last-minute gaps",
  "Direct messaging with the customers who book you",
  "Analytics on bookings, takings and attendance",
];

const NOT_INCLUDED = [
  "No listing fee during the beta",
  "No obligation to take a booking you do not want",
  "No lock-in — your data stays yours",
];

export default function ListYourBusinessPage() {
  return (
    <>
      <div className="container-page py-14 sm:py-20">
        <PageHeader
          eyebrow="For businesses"
          title="Put your business on Layan"
          description="Fill the slots you are not selling, take bookings without answering the phone, and keep control of your own diary."
        />

        <div className="mt-14 grid gap-8 lg:grid-cols-2">
          <section className="card" aria-labelledby="included-heading">
            <h2 id="included-heading" className="mb-5 text-xl">
              What you get
            </h2>
            <ul className="space-y-3.5">
              {INCLUDED.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success/10">
                    <Check size={12} className="text-success" aria-hidden="true" />
                  </span>
                  <span className="leading-relaxed text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="card" aria-labelledby="terms-heading">
            <h2 id="terms-heading" className="mb-5 text-xl">
              How it works for you
            </h2>
            <ul className="space-y-3.5">
              {NOT_INCLUDED.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted">
                    <X size={12} className="text-muted-foreground" aria-hidden="true" />
                  </span>
                  <span className="leading-relaxed text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 rounded-2xl bg-background p-5">
              <h3 className="mb-2 text-base">Verification</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Every new listing is reviewed by our team before it appears in search. Once approved, your
                business is visible to every customer on Layan and you can start taking bookings immediately.
              </p>
            </div>
          </section>
        </div>
      </div>

      <ListYourBusinessCta />
    </>
  );
}
