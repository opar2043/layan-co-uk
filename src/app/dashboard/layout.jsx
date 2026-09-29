import AuthGuard from "@/components/Auth/AuthGuard";
import DashboardShell from "@/components/Dashboard/DashboardShell";

export const metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

/**
 * AuthGuard with no `requiredRole` — the per-page guard handles role enforcement,
 * and this layer only guarantees a session exists before the shell renders.
 */
export default function DashboardLayout({ children }) {
  return (
    <AuthGuard>
      <DashboardShell>{children}</DashboardShell>
    </AuthGuard>
  );
}
