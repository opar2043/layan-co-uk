import AuthGuard from "@/components/Auth/AuthGuard";
import CustomerBookings from "@/components/Dashboard/customer/CustomerBookings";

export const metadata = {
  title: "My bookings",
  robots: { index: false, follow: false },
};

export default function CustomerBookingsPage() {
  return (
    <AuthGuard requiredRole="customer">
      <CustomerBookings />
    </AuthGuard>
  );
}
