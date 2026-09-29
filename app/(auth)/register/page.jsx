import { Suspense } from "react";
import RegisterClient from "./RegisterClient";

export const metadata = {
  title: "Create your account",
  description: "Sign up to book appointments on Layan, or list your salon, barber or nail bar.",
  alternates: { canonical: "/register" },
  robots: { index: false, follow: false },
};

export default function RegisterPage() {
  return (
    <Suspense fallback={<RegisterSkeleton />}>
      <RegisterClient />
    </Suspense>
  );
}

function RegisterSkeleton() {
  return (
    <div aria-busy="true">
      <div className="skeleton mb-2 h-9 w-72" />
      <div className="skeleton mb-7 h-4 w-80" />
      <div className="skeleton mb-7 h-14 w-full rounded-2xl" />
      <div className="card space-y-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="skeleton h-12 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
