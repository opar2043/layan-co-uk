import PageHeader from "@/components/Public/PageHeader";
import { Mail, MessageSquare, Store, HelpCircle } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Contact us",
  description:
    "Get in touch with the Layan team about a booking, your business listing, or anything else.",
  alternates: { canonical: "/contact" },
};

const CHANNELS = [
  {
    icon: HelpCircle,
    title: "Booking help",
    body: "Something wrong with an appointment you made? Include the booking reference and we will sort it out.",
  },
  {
    icon: Store,
    title: "Business enquiries",
    body: "Want to list your salon, barber or nail bar? Registration takes a few minutes and we review every listing.",
  },
  {
    icon: MessageSquare,
    title: "Everything else",
    body: "Press, partnerships, accessibility feedback — this inbox reaches a person.",
  },
];

export default function ContactPage() {
  return (
    <div className="container-page py-14 sm:py-20">
      <PageHeader
        eyebrow="Contact"
        title="Talk to the Layan team"
        description="We read every message. If something has gone wrong with a booking, tell us and we will fix it."
      />

      <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="card">
          <h2 className="mb-2 text-xl">Send us a message</h2>
          <p className="mb-6 text-sm text-muted-foreground">
            The contact form needs a backend endpoint to submit to, which the Layan API does not expose yet.
            Email us directly in the meantime and we will pick it up.
          </p>

          <a href="mailto:hello@layan.app" className="btn-primary">
            <Mail size={16} aria-hidden="true" />
            Email hello@layan.app
          </a>
        </div>

        <ul className="space-y-4">
          {CHANNELS.map((channel) => (
            <li key={channel.title} className="card">
              <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-accent-light">
                <channel.icon size={18} className="text-accent" aria-hidden="true" />
              </span>
              <h3 className="mb-1.5 text-base">{channel.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{channel.body}</p>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-10 text-sm text-muted-foreground">
        Looking for how booking works instead?{" "}
        <Link href="/how-it-works" className="font-medium text-accent hover:underline">
          Read the guide
        </Link>
        .
      </p>
    </div>
  );
}
