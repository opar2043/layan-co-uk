import AuthGuard from "@/components/Auth/AuthGuard";
import OwnerWaitlist from "@/components/Dashboard/owner/OwnerWaitlist";

export const metadata = {
  title: "waitlist",
  robots: { index: false, follow: false },
};

export default function OwnerWaitlistPage() {
  return (
    <AuthGuard requiredRole="owner">
      <OwnerWaitlist />
    </AuthGuard>
  );
}
