"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import queryClient from "@/lib/queryClient";
import { AuthProvider } from "./Auth/AuthProvider";

/**
 * Client boundary for the whole app: React Query, then auth (which owns the
 * credential the Axios instance reads), then toasts.
 *
 * Order matters — AuthProvider must be inside QueryClientProvider so it can
 * invalidate queries after a login or profile mutation.
 */
export default function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#1F1B16",
              color: "#FFFFFF",
              borderRadius: "12px",
              fontSize: "14px",
              padding: "12px 16px",
            },
            success: { iconTheme: { primary: "#2F8F5B", secondary: "#FFFFFF" } },
            error: { iconTheme: { primary: "#C24F4F", secondary: "#FFFFFF" } },
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  );
}
