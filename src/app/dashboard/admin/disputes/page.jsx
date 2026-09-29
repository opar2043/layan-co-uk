import AuthGuard from "@/components/Auth/AuthGuard";
import AdminDisputes from "@/components/Dashboard/admin/AdminDisputes";

export const metadata = {
  title: "Disputes",
  robots: { index: false, follow: false },
};

export default function AdminDisputesPage() {
  return (
    <AuthGuard requiredRole="admin">
      <AdminDisputes />
    </AuthGuard>
  );
}
