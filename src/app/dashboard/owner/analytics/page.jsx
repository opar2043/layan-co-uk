import AuthGuard from "@/components/Auth/AuthGuard";
import OwnerAnalytics from "@/components/Dashboard/owner/OwnerAnalytics";

export const metadata = {
  title: "analytics",
  robots: { index: false, follow: false },
};

export default function OwnerAnalyticsPage() {
  return (
    <AuthGuard requiredRole="owner">
      <OwnerAnalytics />
    </AuthGuard>
  );
}
