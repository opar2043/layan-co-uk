import AuthGuard from "@/components/Auth/AuthGuard";
import StaffCalendar from "@/components/Dashboard/staff/StaffCalendar";

export const metadata = {
  title: "calendar",
  robots: { index: false, follow: false },
};

export default function StaffCalendarPage() {
  return (
    <AuthGuard requiredRole="staff">
      <StaffCalendar />
    </AuthGuard>
  );
}
