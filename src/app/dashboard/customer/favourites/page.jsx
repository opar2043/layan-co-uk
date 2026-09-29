import AuthGuard from "@/components/Auth/AuthGuard";
import CustomerFavourites from "@/components/Dashboard/customer/CustomerFavourites";

export const metadata = {
  title: "Saved businesses",
  robots: { index: false, follow: false },
};

export default function CustomerFavouritesPage() {
  return (
    <AuthGuard requiredRole="customer">
      <CustomerFavourites />
    </AuthGuard>
  );
}
