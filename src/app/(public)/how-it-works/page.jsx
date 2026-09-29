import Link from "next/link";
import PageHeader from "@/components/Public/PageHeader";
import ListYourBusinessCta from "@/components/Layout/ListYourBusinessCta";
import { Search, ClipboardList, CalendarCheck, CreditCard, MessageSquare, Star } from "lucide-react";

export const metadata = {
  title: "How Layan works",
  description:
    "How booking on Layan works for customers, and what a business owner gets in return. From discovery to checkout.",
  alternates: { canonical: "/how-it-works" },
};

const CUSTOMER_STEPS = [
  {
    icon: Search,
    title: "Search and compare",
    body: "Filter by city, category or service. Every result is a verified business, and every price is the real price.",
  },
  {
    icon: ClipboardList,
    title: "Pick a service and staff member",
    body: "Each service shows its duration and full price. Choose a named stylist or let the business assign whoever is free.",
  },
  {
    icon: CalendarCheck,
    title: "Take a slot",
    body: "Choose a date and time. If the slot clashes it is caught immediately, so you never turn up to a double booking.",
  },
  {
    icon: CreditCard,
    title: "Pay a deposit if you want to",
    body: "Deposits are optional and set by the business. Whatever is left is settled at the salon when you attend.",
  },
];

const OWNER_STEPS = [
  {
    icon: ClipboardList,
    title: "Publish your services",
    body: "Add each service with its price and duration. That is the menu customers see and book from.",
  },
  {
    icon: CalendarCheck,
    title: "Manage the diary",
    body: "A day and week board for the whole team, with bookings you can confirm, mark attended, or checkout on the spot.",
  },
  {
    icon: MessageSquare,
    title: "Work the waitlist",
    body: "When a slot opens up, offer it to the next customer waiting instead of letting it sit empty.",
  },
  {
    icon: Star,
    title: "Build a reputation",
    body: "Verified reviews from customers who actually attended, and the Layan Business Score to match.",
  },
];

function StepList({ steps }) {
  return (
    <ol className="mt-8 space-y-5">
      {steps.map((step, index) => (
        <li key={step.title} className="flex gap-4">
          <div className="flex flex-col items-center">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-light">
              <step.icon size={18} className="text-accent" aria-hidden="true" />
            </span>
            {index < steps.length - 1 && <span className="mt-1 w-px flex-1 bg-border" aria-hidden="true" />}
          </div>
          <div className="pb-1">
            <h3 className="text-base font-semibold">
              <span className="mr-2 text-accent">{index + 1}.</span>
              {step.title}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export default function HowItWorksPage() {
  return (
    <>
      <div className="container-page py-14 sm:py-20">
        <PageHeader
          eyebrow="How it works"
          title="Booking on Layan, start to finish"
          description="The same platform serves customers and the businesses they book with. Here is what each side gets."
        />

        <div className="mt-14 grid gap-12 lg:grid-cols-2 lg:gap-16">
          <section aria-labelledby="for-customers">
            <h2 id="for-customers" className="text-2xl">
              If you are a customer
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/search" className="font-medium text-accent hover:underline">
                Find a salon
              </Link>
              .
            </p>
            <StepList steps={CUSTOMER_STEPS} />
          </section>

          <section aria-labelledby="for-businesses">
            <h2 id="for-businesses" className="text-2xl">
              If you run a business
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Listing is free during the beta.{" "}
              <Link href="/list-your-business" className="font-medium text-accent hover:underline">
                See the owner offer
              </Link>
              .
            </p>
            <StepList steps={OWNER_STEPS} />
          </section>
        </div>
      </div>

      <ListYourBusinessCta />
    </>
  );
}
