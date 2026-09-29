import AuthGuard from "@/components/Auth/AuthGuard";
import OwnerCalendar from "@/components/Dashboard/owner/OwnerCalendar";

export const metadata = {
  title: "calendar",
  robots: { index: false, follow: false },
};

export default function OwnerCalendarPage() {
  return (
    <AuthGuard requiredRole="owner">
      <OwnerCalendar />
    </AuthGuard>
  );
}
