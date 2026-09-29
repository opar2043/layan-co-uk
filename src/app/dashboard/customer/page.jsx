import CustomerOverview from "@/components/Dashboard/customer/CustomerOverview";
import AuthGuard from "@/components/Auth/AuthGuard";

export const metadata = {
  title: "My dashboard",
  robots: { index: false, follow: false },
};

export default function CustomerDashboardPage() {
  return (
    <AuthGuard requiredRole="customer">
      <CustomerOverview />
    </AuthGuard>
  );
}
