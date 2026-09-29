import AuthGuard from "@/components/Auth/AuthGuard";
import OwnerReviews from "@/components/Dashboard/owner/OwnerReviews";

export const metadata = {
  title: "reviews",
  robots: { index: false, follow: false },
};

export default function OwnerReviewsPage() {
  return (
    <AuthGuard requiredRole="owner">
      <OwnerReviews />
    </AuthGuard>
  );
}
