"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, CalendarDays, Scissors, Users, Clock, Star, Tag,
  MessageSquare, BarChart3, Store, ShieldAlert, Wallet, Heart, UserCog,
  LogOut, Menu, X,
} from "lucide-react";
import useAuth from "@/components/Auth/useAuth";
import { classNames, initials } from "@/lib/utils";

/**
 * Role-aware navigation. Each entry is the single source of truth for that role's
 * pages — adding a route means adding it here, not in four places.
 */
const NAV = {
  customer: [
    { href: "/dashboard/customer", label: "Overview", icon: LayoutDashboard, exact: true },
    { href: "/dashboard/customer/bookings", label: "Bookings", icon: CalendarDays },
    { href: "/dashboard/customer/favourites", label: "Favourites", icon: Heart },
    { href: "/dashboard/customer/wallet", label: "Wallet", icon: Wallet },
    { href: "/dashboard/customer/messages", label: "Messages", icon: MessageSquare },
    { href: "/dashboard/customer/profile", label: "Profile", icon: UserCog },
  ],
  owner: [
    { href: "/dashboard/owner", label: "Overview", icon: LayoutDashboard, exact: true },
    { href: "/dashboard/owner/profile", label: "Business profile", icon: Store },
    { href: "/dashboard/owner/services", label: "Services", icon: Scissors },
    { href: "/dashboard/owner/staff", label: "Staff", icon: Users },
    { href: "/dashboard/owner/calendar", label: "Calendar", icon: CalendarDays },
    { href: "/dashboard/owner/waitlist", label: "Waitlist", icon: Clock },
    { href: "/dashboard/owner/reviews", label: "Reviews", icon: Star },
    { href: "/dashboard/owner/promotions", label: "Promotions", icon: Tag },
    { href: "/dashboard/owner/messages", label: "Messages", icon: MessageSquare },
    { href: "/dashboard/owner/analytics", label: "Analytics", icon: BarChart3 },
  ],
  staff: [
    { href: "/dashboard/staff", label: "Today", icon: LayoutDashboard, exact: true },
    { href: "/dashboard/staff/calendar", label: "Calendar", icon: CalendarDays },
    { href: "/dashboard/staff/profile", label: "Profile", icon: UserCog },
  ],
  admin: [
    { href: "/dashboard/admin", label: "Overview", icon: LayoutDashboard, exact: true },
    { href: "/dashboard/admin/businesses", label: "Businesses", icon: Store },
    { href: "/dashboard/admin/users", label: "Users", icon: Users },
    { href: "/dashboard/admin/disputes", label: "Disputes", icon: ShieldAlert },
    { href: "/dashboard/admin/fraud", label: "Fraud", icon: ShieldAlert },
    { href: "/dashboard/admin/promotions", label: "Promotions", icon: Tag },
  ],
};

const ROLE_LABEL = {
  customer: "Customer",
  owner: "Business owner",
  staff: "Staff",
  admin: "Admin",
};

function NavLinks({ items, pathname, onNavigate }) {
  return (
    <ul className="space-y-1">
      {items.map(({ href, label, icon: NavIcon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <li key={href}>
            <Link
              href={href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={classNames(
                "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-accent-light text-accent"
                  : "text-muted-foreground hover:bg-muted hover:text-primary"
              )}
            >
              <NavIcon size={17} aria-hidden="true" />
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Sidebar + topbar on desktop, slide-over drawer plus a fixed bottom nav bar on
 * mobile. The bottom bar is capped at the five most-used destinations so labels
 * stay legible at 375px.
 */
export default function DashboardShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, logout } = useAuth();
  const [drawer, setDrawer] = useState(false);

  const items = NAV[role] ?? [];
  const displayName =
    user?.name ?? user?.ownerName ?? user?.businessName ?? user?.email ?? "Account";

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ---------------- topbar ---------------- */}
      <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur">
        <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
          <button
            type="button"
            onClick={() => setDrawer(true)}
            className="rounded-xl p-2 text-primary hover:bg-muted lg:hidden"
            aria-label="Open navigation"
            aria-expanded={drawer}
          >
            <Menu size={20} aria-hidden="true" />
          </button>

          <Link href="/" className="flex items-center gap-2 lg:hidden" aria-label="Layan home">
            <span className="text-base font-extrabold tracking-tight">Layan</span>
          </Link>

          <div className="hidden lg:block">
            <p className="text-sm font-semibold">{ROLE_LABEL[role] ?? "Dashboard"}</p>
            <p className="text-xs text-muted-foreground">Signed in as {displayName}</p>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Link href="/search" className="btn-ghost btn-sm hidden sm:inline-flex">
              Browse salons
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="btn-ghost btn-sm"
              aria-label="Sign out"
            >
              <LogOut size={15} aria-hidden="true" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
            <span
              className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground"
              aria-hidden="true"
            >
              {initials(displayName)}
            </span>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* ---------------- desktop sidebar ---------------- */}
        <aside className="hidden w-64 shrink-0 border-r border-border bg-surface lg:block">
          <nav className="sticky top-16 p-4" aria-label="Dashboard">
            <NavLinks items={items} pathname={pathname} />
          </nav>
        </aside>

        {/* ---------------- mobile drawer ---------------- */}
        {drawer && (
          <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
            <div className="absolute inset-0 bg-primary/40 backdrop-blur-sm" onClick={() => setDrawer(false)} />
            <div className="absolute inset-y-0 left-0 w-72 overflow-y-auto bg-surface p-5 shadow-pop">
              <div className="mb-6 flex items-center justify-between">
                <p className="text-sm font-semibold">{ROLE_LABEL[role] ?? "Dashboard"}</p>
                <button
                  type="button"
                  onClick={() => setDrawer(false)}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
                  aria-label="Close navigation"
                >
                  <X size={18} aria-hidden="true" />
                </button>
              </div>
              <p className="mb-5 truncate rounded-xl bg-muted px-3.5 py-2.5 text-xs text-muted-foreground">
                {displayName}
              </p>
              <NavLinks items={items} pathname={pathname} onNavigate={() => setDrawer(false)} />
            </div>
          </div>
        )}

        {/* ---------------- content ---------------- */}
        <main id="main" className="min-w-0 flex-1 px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-12">
          {children}
        </main>
      </div>

      {/* ---------------- mobile bottom nav ---------------- */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 backdrop-blur lg:hidden"
        aria-label="Dashboard"
      >
        <ul className="grid grid-cols-5">
          {items.slice(0, 5).map(({ href, label, icon: NavIcon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={classNames(
                    "flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors",
                    active ? "text-accent" : "text-muted-foreground"
                  )}
                >
                  <NavIcon size={18} aria-hidden="true" />
                  <span className="max-w-full truncate px-1">{label.split(" ")[0]}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
