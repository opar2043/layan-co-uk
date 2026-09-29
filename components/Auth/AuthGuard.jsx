"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import useAuth from "./useAuth";

/**
 * Wraps app/dashboard/layout.jsx.
 *
 * Two rules, in order:
 *  1. Nobody signed in -> /login (remembering where they were headed).
 *  2. Signed in as the wrong role -> the correct /dashboard/<role>, because the
 *     URL segment is an authorisation hint, not a suggestion. A staff member who
 *     hand-types /dashboard/owner is redirected to their own dashboard rather
 *     than being allowed to render someone else's nav.
 */
export default function AuthGuard({ children, requiredRole }) {
  const { isAuthenticated, role, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      const next = encodeURIComponent(pathname || "/dashboard");
      router.replace(`/login?next=${next}`);
      return;
    }

    // The first path segment under /dashboard is the role.
    const segment = pathname.split("/")[2];
    if (segment && segment !== role) {
      router.replace(`/dashboard/${role}`);
    }
  }, [isAuthenticated, role, isLoading, pathname, router]);

  // `requiredRole` is checked on top of the URL segment so a page that only ever
  // serves one role (e.g. /dashboard/admin) cannot be reached by another.
  const blocked =
    isAuthenticated && requiredRole && role !== requiredRole && !requiredRole.split(",").includes(role);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center" role="status" aria-label="Loading">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-border border-t-accent" />
          <p className="text-sm text-muted-foreground">Checking your session…</p>
        </div>
      </div>
    );
  }

  if (blocked) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <div className="card max-w-md text-center">
          <h1 className="text-xl">That page is for another role</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            You are signed in as <strong>{role}</strong>. This area is restricted to{" "}
            <strong>{requiredRole}</strong>.
          </p>
          <button
            type="button"
            className="btn-primary mt-6"
            onClick={() => router.replace(`/dashboard/${role}`)}
          >
            Go to my dashboard
          </button>
        </div>
      </div>
    );
  }

  // Unauthenticated: the effect above is already redirecting, so render nothing
  // rather than flash the shell. A wrong role was handled by `blocked` above.
  if (!isAuthenticated) return null;

  return children;
}
