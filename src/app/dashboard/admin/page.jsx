import AuthGuard from "@/components/Auth/AuthGuard";
import AdminOverview from "@/components/Dashboard/admin/AdminOverview";

export const metadata = {
  title: "Admin dashboard",
  robots: { index: false, follow: false },
};

export default function AdminDashboardPage() {
  return (
    <AuthGuard requiredRole="admin">
      <AdminOverview />
    </AuthGuard>
  );
}
