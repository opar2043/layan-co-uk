import AuthGuard from "@/components/Auth/AuthGuard";
import CustomerMessages from "@/components/Dashboard/customer/CustomerMessages";

export const metadata = {
  title: "Messages",
  robots: { index: false, follow: false },
};

export default function CustomerMessagesPage() {
  return (
    <AuthGuard requiredRole="customer">
      <CustomerMessages />
    </AuthGuard>
  );
}
