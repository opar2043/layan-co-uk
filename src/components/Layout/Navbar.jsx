"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Scissors, LogOut, LayoutDashboard, Loader2 } from "lucide-react";
import useAuth from "@/components/Auth/useAuth";
import { classNames } from "@/lib/utils";

const LINKS = [
  { href: "/search", label: "Find a salon" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, role, isLoading, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile sheet whenever the route changes.
  useEffect(() => setOpen(false), [pathname]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <header
      className={classNames(
        "sticky top-0 z-50 border-b transition-colors duration-200",
        scrolled ? "border-border bg-background/90 backdrop-blur" : "border-transparent bg-background"
      )}
    >
      <nav className="container-page flex h-16 items-center justify-between gap-4" aria-label="Main">
        <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="Layan home">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Scissors size={17} aria-hidden="true" />
          </span>
          <span className="text-lg font-extrabold tracking-tight">Layan</span>
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={classNames(
                    "rounded-xl px-3.5 py-2 text-sm font-medium transition-colors",
                    active ? "bg-accent-light text-accent" : "text-muted-foreground hover:text-primary"
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="hidden items-center gap-2 lg:flex">
          {isLoading ? (
            <Loader2 size={18} className="animate-spin text-muted-foreground" aria-label="Loading" />
          ) : isAuthenticated ? (
            <>
              <Link href={`/dashboard/${role}`} className="btn-outline btn-sm">
                <LayoutDashboard size={14} aria-hidden="true" />
                Dashboard
              </Link>
              <button type="button" onClick={handleLogout} className="btn-ghost btn-sm">
                <LogOut size={14} aria-hidden="true" />
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-ghost btn-sm">
                Sign in
              </Link>
              <Link href="/register" className="btn-primary btn-sm">
                Get started
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="rounded-xl p-2 text-primary hover:bg-muted lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
        </button>
      </nav>

      {open && (
        <div id="mobile-menu" className="border-t border-border bg-surface lg:hidden">
          <div className="container-page space-y-1 py-4">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={classNames(
                  "block rounded-xl px-4 py-3 text-sm font-medium",
                  pathname === link.href ? "bg-accent-light text-accent" : "text-primary hover:bg-muted"
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex gap-2 pt-3">
              {isAuthenticated ? (
                <>
                  <Link href={`/dashboard/${role}`} className="btn-primary flex-1">
                    Dashboard
                  </Link>
                  <button type="button" onClick={handleLogout} className="btn-outline flex-1">
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="btn-outline flex-1">
                    Sign in
                  </Link>
                  <Link href="/register" className="btn-primary flex-1">
                    Get started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
