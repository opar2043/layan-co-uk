import AuthGuard from "@/components/Auth/AuthGuard";
import OwnerServices from "@/components/Dashboard/owner/OwnerServices";

export const metadata = {
  title: "services",
  robots: { index: false, follow: false },
};

export default function OwnerServicesPage() {
  return (
    <AuthGuard requiredRole="owner">
      <OwnerServices />
    </AuthGuard>
  );
}
