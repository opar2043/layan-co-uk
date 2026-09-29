import PageHeader from "@/components/Public/PageHeader";
import { ChevronDown } from "lucide-react";

export const metadata = {
  title: "Frequently asked questions",
  description:
    "Answers about booking on Layan, business verification, deposits, cancellations and reviews.",
  alternates: { canonical: "/faq" },
};

const GROUPS = [
  {
    title: "Booking",
    items: [
      {
        q: "Do I need an account to book?",
        a: "Yes. You need a Layan account so the business knows who to expect and so you can manage or cancel the appointment. Signing in takes a few seconds and is handled by Firebase.",
      },
      {
        q: "Can I pick a specific staff member?",
        a: "You can. Each service lists the team who performs it, and you can choose a specific person or leave it open for the business to assign whoever is free.",
      },
      {
        q: "What is a deposit?",
        a: "A deposit is an amount you pay up front to secure the slot. It is optional and set by the business. Anything outstanding is settled at the salon when you attend.",
      },
      {
        q: "Can I cancel a booking?",
        a: "Yes — you can cancel your own appointment from your dashboard at any point before it happens. The business's cancellation policy determines whether the deposit is returned.",
      },
    ],
  },
  {
    title: "For businesses",
    items: [
      {
        q: "How long does verification take?",
        a: "Every new listing is reviewed by our team before it appears in search. You will get an email once your listing has been approved.",
      },
      {
        q: "Can I manage my own calendar?",
        a: "Yes. Owners get a full dashboard covering services, staff, the booking calendar, the waitlist, reviews, promotions and messages.",
      },
      {
        q: "What does Layan charge?",
        a: "There is no listing fee during the beta period. Fees and commission will be communicated before any business is charged.",
      },
    ],
  },
  {
    title: "Reviews and safety",
    items: [
      {
        q: "Who can leave a review?",
        a: "Only customers who actually attended an appointment. One review per booking, and the review is tied to the real appointment record.",
      },
      {
        q: "Can a business reply to a review?",
        a: "Yes. Owners and staff can post a public reply from the reviews panel in their dashboard.",
      },
      {
        q: "How are businesses verified?",
        a: "We check the business details and confirm they are a genuine trading entity before approving the listing. Only verified businesses appear in search results.",
      },
    ],
  },
];

function FaqItem({ question, answer }) {
  return (
    <details className="group rounded-2xl bg-surface p-5 shadow-card">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold marker:hidden">
        {question}
        <ChevronDown
          size={17}
          className="shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{answer}</p>
    </details>
  );
}

export default function FaqPage() {
  return (
    <div className="container-page py-14 sm:py-20">
      <PageHeader
        eyebrow="Support"
        title="Frequently asked questions"
        description="Everything customers and businesses ask most often."
      />

      <div className="mt-12 space-y-12">
        {GROUPS.map((group) => (
          <section key={group.title} aria-labelledby={`faq-${group.title}`}>
            <h2 id={`faq-${group.title}`} className="mb-5 text-xl">
              {group.title}
            </h2>
            <div className="space-y-3">
              {group.items.map((item) => (
                <FaqItem key={item.q} question={item.q} answer={item.a} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
