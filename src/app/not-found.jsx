import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-20">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-light">
          <Compass size={26} className="text-accent" aria-hidden="true" />
        </div>
        <p className="text-sm font-semibold text-accent">404</p>
        <h1 className="mt-2 text-3xl">We could not find that page</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          The link may be out of date, or the business may no longer be listed on Layan.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-2.5 sm:flex-row">
          <Link href="/" className="btn-primary">
            Back to home
          </Link>
          <Link href="/search" className="btn-outline">
            Find a salon
          </Link>
        </div>
      </div>
    </div>
  );
}
