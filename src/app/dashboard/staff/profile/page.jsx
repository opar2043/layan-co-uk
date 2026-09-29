import AuthGuard from "@/components/Auth/AuthGuard";
import StaffProfile from "@/components/Dashboard/staff/StaffProfile";

export const metadata = {
  title: "profile",
  robots: { index: false, follow: false },
};

export default function StaffProfilePage() {
  return (
    <AuthGuard requiredRole="staff">
      <StaffProfile />
    </AuthGuard>
  );
}
