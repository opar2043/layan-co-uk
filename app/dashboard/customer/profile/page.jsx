import AuthGuard from "@/components/Auth/AuthGuard";
import CustomerProfile from "@/components/Dashboard/customer/CustomerProfile";

export const metadata = {
  title: "My profile",
  robots: { index: false, follow: false },
};

export default function CustomerProfilePage() {
  return (
    <AuthGuard requiredRole="customer">
      <CustomerProfile />
    </AuthGuard>
  );
}
