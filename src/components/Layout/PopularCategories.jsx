import Link from "next/link";
import { ArrowRight } from "lucide-react";
import SectionHeading from "@/components/Public/SectionHeading";
import { CATEGORIES } from "@/lib/constants";

/** Icon-less category grid — a photo per category would need real assets. */
export default function PopularCategories() {
  return (
    <section className="container-page py-16 sm:py-20" aria-labelledby="categories-heading">
      <SectionHeading
        eyebrow="Browse"
        title="Popular categories"
        description="From a quick tidy-up to a full transformation — find the kind of service you need."
        action={
          <Link href="/search" className="btn-outline btn-sm">
            See all
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        }
      />

      <h2 id="categories-heading" className="sr-only">
        Popular categories
      </h2>

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {CATEGORIES.map((category) => (
          <li key={category}>
            <Link
              href={`/search?category=${encodeURIComponent(category)}`}
              className="group flex h-full flex-col justify-between rounded-2xl bg-surface p-5 shadow-card transition-shadow hover:shadow-card-hover"
            >
              <span className="text-base font-semibold">{category}</span>
              <span className="mt-6 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors group-hover:text-accent">
                Browse
                <ArrowRight size={13} aria-hidden="true" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
