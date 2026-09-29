import AuthGuard from "@/components/Auth/AuthGuard";
import AdminFraud from "@/components/Dashboard/admin/AdminFraud";

export const metadata = {
  title: "Fraud flags",
  robots: { index: false, follow: false },
};

export default function AdminFraudPage() {
  return (
    <AuthGuard requiredRole="admin">
      <AdminFraud />
    </AuthGuard>
  );
}
