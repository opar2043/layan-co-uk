import PageHeader from "@/components/Public/PageHeader";
import { Target, ShieldCheck, Users, Wallet } from "lucide-react";

export const metadata = {
  title: "About Layan",
  description:
    "Layan is a booking marketplace for salons, barbers and nail bars. Learn why we built it and how verification works.",
  alternates: { canonical: "/about" },
};

const VALUES = [
  {
    icon: ShieldCheck,
    title: "Verification first",
    body: "A business only appears in search once our team has reviewed it. No unverified listings, ever.",
  },
  {
    icon: Users,
    title: "Owners keep control",
    body: "Owners set their own prices, staff and availability. Layan does not take control of a diary.",
  },
  {
    icon: Wallet,
    title: "Transparent pricing",
    body: "The price you see is the price on the day. No hidden fees added at checkout.",
  },
  {
    icon: Target,
    title: "Built for the trade",
    body: "Salons, barbers and nail bars first — everything else follows from what they actually need.",
  },
];

export default function AboutPage() {
  return (
    <div className="container-page py-14 sm:py-20">
      <PageHeader
        eyebrow="About us"
        title="Booking that respects both sides of the chair"
        description="Layan connects customers with verified salons, barbers and nail bars, and gives those businesses a diary they can actually run on."
      />

      <div className="mt-12 max-w-3xl space-y-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
        <p>
          Booking an appointment has traditionally meant a phone call during opening hours, a notebook, and
          a good memory for whose turn it is. That works at two chairs. It does not work at twenty.
        </p>
        <p>
          Layan replaces all of it with a calendar that customers and businesses share. Customers see real
          availability, real prices and real reviews. Businesses see their day, their waitlist and their
          takings in one place.
        </p>
        <p>
          Every listing goes through verification before it becomes searchable, because a marketplace is only
          as good as its weakest listing.
        </p>
      </div>

      <section className="mt-16" aria-labelledby="values-heading">
        <h2 id="values-heading" className="mb-8 text-2xl">
          What we believe
        </h2>
        <ul className="grid gap-5 sm:grid-cols-2">
          {VALUES.map((value) => (
            <li key={value.title} className="card">
              <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-accent-light">
                <value.icon size={20} className="text-accent" aria-hidden="true" />
              </span>
              <h3 className="mb-2 text-lg">{value.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{value.body}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
