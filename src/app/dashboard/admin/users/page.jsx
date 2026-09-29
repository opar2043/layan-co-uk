import AuthGuard from "@/components/Auth/AuthGuard";
import AdminUsers from "@/components/Dashboard/admin/AdminUsers";

export const metadata = {
  title: "Customers",
  robots: { index: false, follow: false },
};

export default function AdminUsersPage() {
  return (
    <AuthGuard requiredRole="admin">
      <AdminUsers />
    </AuthGuard>
  );
}
