import AuthGuard from "@/components/Auth/AuthGuard";
import OwnerPromotions from "@/components/Dashboard/owner/OwnerPromotions";

export const metadata = {
  title: "promotions",
  robots: { index: false, follow: false },
};

export default function OwnerPromotionsPage() {
  return (
    <AuthGuard requiredRole="owner">
      <OwnerPromotions />
    </AuthGuard>
  );
}
