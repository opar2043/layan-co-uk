"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import useAuth from "@/components/Auth/useAuth";

const HOME = {
  customer: "/dashboard/customer",
  owner: "/dashboard/owner",
  staff: "/dashboard/staff",
  admin: "/dashboard/admin",
};

/** Sends the signed-in user to the dashboard home for their role. */
export default function DashboardIndex() {
  const router = useRouter();
  const { role, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    router.replace(HOME[role] ?? "/login");
  }, [role, isLoading, router]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center" role="status" aria-label="Loading dashboard">
      <Loader2 size={22} className="animate-spin text-accent" />
    </div>
  );
}
