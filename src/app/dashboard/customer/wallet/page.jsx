import AuthGuard from "@/components/Auth/AuthGuard";
import CustomerWallet from "@/components/Dashboard/customer/CustomerWallet";

export const metadata = {
  title: "Wallet",
  robots: { index: false, follow: false },
};

export default function CustomerWalletPage() {
  return (
    <AuthGuard requiredRole="customer">
      <CustomerWallet />
    </AuthGuard>
  );
}
