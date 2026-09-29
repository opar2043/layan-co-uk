import SectionHeading from "@/components/Public/SectionHeading";
import Rating from "@/components/Public/Rating";
import { Quote } from "lucide-react";

/**
 * Illustrative quotes.
 *
 * The backend has no testimonials collection, so these are clearly-labelled
 * marketing copy rather than fabricated customer reviews pulled from the API.
 * Anything presented as a real review must come from `GET /reviews`.
 */
const QUOTES = [
  {
    quote:
      "Booked a cut for the Saturday morning, turned up on time, walked out happy. No phone tag.",
    name: "Priya S.",
    detail: "Customer",
  },
  {
    quote:
      "My waitlist used to be a paper diary by the front desk. Now it fills the quiet slots for me.",
    name: "Marcus T.",
    detail: "Salon owner",
  },
  {
    quote:
      "Being able to see the whole week at a glance means I stopped double-booking my own chair.",
    name: "Aisha R.",
    detail: "Staff member",
  },
];

export default function Testimonials() {
  return (
    <section className="border-y border-border bg-surface py-16 sm:py-20" aria-labelledby="testimonials">
      <div className="container-page">
        <SectionHeading
          eyebrow="Testimonials"
          title="What people say"
          description="Sample copy for the marketing site — real reviews appear on each business profile."
          align="center"
        />
        <h2 id="testimonials" className="sr-only">
          Testimonials
        </h2>

        <ul className="grid gap-5 md:grid-cols-3">
          {QUOTES.map((item) => (
            <li key={item.name} className="flex flex-col rounded-2xl bg-background p-6">
              <Quote size={20} className="mb-4 text-accent" aria-hidden="true" />
              <blockquote className="flex-1 text-sm leading-relaxed text-primary">
                “{item.quote}”
              </blockquote>
              <div className="mt-5 flex items-center gap-3 border-t border-border pt-4">
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-light text-xs font-bold text-accent"
                  aria-hidden="true"
                >
                  {item.name.slice(0, 1)}
                </span>
                <div>
                  <p className="text-sm font-semibold">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.detail}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
