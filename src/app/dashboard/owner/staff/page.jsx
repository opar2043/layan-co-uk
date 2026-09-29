import AuthGuard from "@/components/Auth/AuthGuard";
import OwnerStaff from "@/components/Dashboard/owner/OwnerStaff";

export const metadata = {
  title: "staff",
  robots: { index: false, follow: false },
};

export default function OwnerStaffPage() {
  return (
    <AuthGuard requiredRole="owner">
      <OwnerStaff />
    </AuthGuard>
  );
}
