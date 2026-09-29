import AuthGuard from "@/components/Auth/AuthGuard";
import StaffToday from "@/components/Dashboard/staff/StaffToday";

export const metadata = {
  title: "Staff dashboard",
  robots: { index: false, follow: false },
};

export default function StaffDashboardPage() {
  return (
    <AuthGuard requiredRole="staff">
      <StaffToday />
    </AuthGuard>
  );
}
