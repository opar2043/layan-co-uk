import Link from "next/link";
import { Scissors } from "lucide-react";

const COLUMNS = [
  {
    title: "Discover",
    links: [
      { href: "/search", label: "Find a salon" },
      { href: "/how-it-works", label: "How it works" },
      { href: "/faq", label: "FAQ" },
    ],
  },
  {
    title: "For businesses",
    links: [
      { href: "/list-your-business", label: "List your business" },
      { href: "/register", label: "Owner sign up" },
      { href: "/how-it-works", label: "Owner guide" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About Layan" },
      { href: "/contact", label: "Contact us" },
      { href: "/terms", label: "Terms" },
      { href: "/privacy", label: "Privacy" },
    ],
  },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-border bg-surface">
      <div className="container-page py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2" aria-label="Layan home">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Scissors size={17} aria-hidden="true" />
              </span>
              <span className="text-lg font-extrabold tracking-tight">Layan</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              One place to discover verified salons, barbers and nail bars, and book the slot that suits you.
            </p>
          </div>

          {COLUMNS.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="mb-3.5 text-xs font-semibold uppercase tracking-[0.12em] text-primary">
                {column.title}
              </h2>
              <ul className="space-y-2.5">
                {column.links.map((link) => (
                  <li key={`${column.title}-${link.href}-${link.label}`}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-accent"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {year} Layan. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Made for salons, barbers and nail bars across the UK.
          </p>
        </div>
      </div>
    </footer>
  );
}
