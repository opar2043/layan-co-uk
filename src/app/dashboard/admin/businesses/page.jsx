import AuthGuard from "@/components/Auth/AuthGuard";
import AdminBusinesses from "@/components/Dashboard/admin/AdminBusinesses";

export const metadata = {
  title: "Business verification",
  robots: { index: false, follow: false },
};

export default function AdminBusinessesPage() {
  return (
    <AuthGuard requiredRole="admin">
      <AdminBusinesses />
    </AuthGuard>
  );
}
