import Link from "next/link";
import { Scissors } from "lucide-react";

/** Centred auth shell — deliberately chrome-free so the form is the focus. */
export const metadata = {
  title: "Sign in or create an account",
  robots: { index: false, follow: false },
};

export default function AuthLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="container-page flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2" aria-label="Layan home">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Scissors size={17} aria-hidden="true" />
          </span>
          <span className="text-lg font-extrabold tracking-tight">Layan</span>
        </Link>
        <Link href="/search" className="text-sm font-medium text-muted-foreground hover:text-accent">
          Browse salons
        </Link>
      </header>

      <main id="main" className="flex flex-1 items-center justify-center px-4 py-10 sm:py-16">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
