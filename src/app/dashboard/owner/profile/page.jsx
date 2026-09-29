import AuthGuard from "@/components/Auth/AuthGuard";
import OwnerBusinessProfile from "@/components/Dashboard/owner/OwnerBusinessProfile";

export const metadata = {
  title: "profile",
  robots: { index: false, follow: false },
};

export default function OwnerBusinessProfilePage() {
  return (
    <AuthGuard requiredRole="owner">
      <OwnerBusinessProfile />
    </AuthGuard>
  );
}
