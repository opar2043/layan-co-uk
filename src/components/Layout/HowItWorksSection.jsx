import SectionHeading from "@/components/Public/SectionHeading";
import { Search, CalendarCheck, Sparkles } from "lucide-react";

const STEPS = [
  {
    icon: Search,
    title: "Find your salon",
    body: "Search by service, city or name. Every listing you see has been verified by Layan, so what you book is what you get.",
  },
  {
    icon: CalendarCheck,
    title: "Pick a slot",
    body: "Choose a service, pick a staff member or let the salon assign one, then take the time that suits you.",
  },
  {
    icon: Sparkles,
    title: "Turn up",
    body: "Pay a deposit if you want to, and manage or rebook every appointment from your dashboard.",
  },
];

export default function HowItWorksSection() {
  return (
    <section className="border-y border-border bg-surface py-16 sm:py-20" aria-labelledby="how-it-works">
      <div className="container-page">
        <SectionHeading
          eyebrow="How it works"
          title="Three steps, no phone calls"
          description="Layan removes the back-and-forth of booking an appointment."
          align="center"
        />

        <ol className="grid gap-5 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.title} className="relative rounded-2xl bg-background p-6 sm:p-7">
              <span className="absolute right-5 top-5 text-4xl font-extrabold text-border" aria-hidden="true">
                {index + 1}
              </span>
              <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-accent-light">
                <step.icon size={20} className="text-accent" aria-hidden="true" />
              </span>
              <h3 className="mb-2 text-lg">{step.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
