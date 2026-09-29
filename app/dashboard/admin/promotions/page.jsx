import AuthGuard from "@/components/Auth/AuthGuard";
import AdminPromotions from "@/components/Dashboard/admin/AdminPromotions";

export const metadata = {
  title: "Promotions",
  robots: { index: false, follow: false },
};

export default function AdminPromotionsPage() {
  return (
    <AuthGuard requiredRole="admin">
      <AdminPromotions />
    </AuthGuard>
  );
}
