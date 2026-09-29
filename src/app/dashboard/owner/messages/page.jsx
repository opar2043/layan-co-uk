import AuthGuard from "@/components/Auth/AuthGuard";
import OwnerMessages from "@/components/Dashboard/owner/OwnerMessages";

export const metadata = {
  title: "messages",
  robots: { index: false, follow: false },
};

export default function OwnerMessagesPage() {
  return (
    <AuthGuard requiredRole="owner">
      <OwnerMessages />
    </AuthGuard>
  );
}
