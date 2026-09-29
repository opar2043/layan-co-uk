import AuthGuard from "@/components/Auth/AuthGuard";
import OwnerOverview from "@/components/Dashboard/owner/OwnerOverview";

export const metadata = {
  title: "Owner dashboard",
  robots: { index: false, follow: false },
};

export default function OwnerDashboardPage() {
  return (
    <AuthGuard requiredRole="owner">
      <OwnerOverview />
    </AuthGuard>
  );
}
