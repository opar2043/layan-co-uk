"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, LogIn } from "lucide-react";
import toast from "react-hot-toast";
import RoleToggle from "@/components/Auth/RoleToggle";
import useAuth from "@/components/Auth/useAuth";
import { classNames } from "@/lib/utils";

/** Where each role lands after signing in. */
const ROLE_HOME = {
  customer: "/dashboard/customer",
  owner: "/dashboard/owner",
  staff: "/dashboard/staff",
  admin: "/dashboard/admin",
};

/** Spinner shown while the query string is read. */
function LoginFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center" role="status" aria-label="Loading sign in">
      <Loader2 size={22} className="animate-spin text-accent" />
    </div>
  );
}

export default function LoginPage() {
  // `useSearchParams` forces a client bailout, which Next requires to sit inside a
  // Suspense boundary or /login cannot be prerendered.
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const {
    isAuthenticated,
    role,
    isLoading,
    loginCustomer,
    loginCustomerWithGoogle,
    loginBackend,
  } = useAuth();

  const [selectedRole, setSelectedRole] = useState("customer");
  const [form, setForm] = useState({ email: "", password: "" });
  const [busy, setBusy] = useState(false);

  // ?role= lets /register?role=owner and the nav hand the right tab through.
  const requestedRole = params.get("role");
  useEffect(() => {
    if (requestedRole && ROLE_HOME[requestedRole]) setSelectedRole(requestedRole);
  }, [requestedRole]);

  // Someone already signed in has no business on this page.
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(params.get("next") || ROLE_HOME[role] || "/dashboard");
    }
  }, [isAuthenticated, isLoading, role, router, params]);

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const destination = () => params.get("next") || ROLE_HOME[selectedRole] || "/dashboard";

  const handleCustomer = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      await loginCustomer(form.email.trim(), form.password);
      // The provider's onAuthStateChanged performs the profile sync; navigating
      // immediately would race it, so wait for the auth state to settle.
      toast.success("Welcome back");
      router.push(destination());
    } catch (error) {
      const code = error?.code ?? "";
      const message =
        code === "auth/invalid-credential"
          ? "That email and password do not match"
          : code === "auth/too-many-requests"
            ? "Too many attempts — try again in a few minutes"
            : code === "auth/user-not-found"
              ? "No account found for that email"
              : error?.message || "Could not sign you in";
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    setBusy(true);
    try {
      await loginCustomerWithGoogle();
      toast.success("Signed in with Google");
      router.push(destination());
    } catch (error) {
      if (error?.code !== "auth/popup-closed-by-user") {
        toast.error(error?.message || "Google sign-in failed");
      }
    } finally {
      setBusy(false);
    }
  };

  const handleBackend = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      await loginBackend(selectedRole, { email: form.email.trim(), password: form.password });
      toast.success("Signed in");
      router.push(destination());
    } catch (error) {
      toast.error(error.message || "Could not sign you in");
    } finally {
      setBusy(false);
    }
  };

  const isCustomer = selectedRole === "customer";

  return (
    <>
      <h1 className="mb-2 text-3xl">Welcome back</h1>
      <p className="mb-7 text-sm text-muted-foreground">
        Choose how you use Layan. Customers sign in with an email account; businesses, staff and admins sign
        in against the Layan API.
      </p>

      <RoleToggle value={selectedRole} onChange={setSelectedRole} className="mb-7" />

      {isCustomer ? (
        <div className="card">
          <form onSubmit={handleCustomer} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="label">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={set("email")}
                placeholder="you@example.com"
                className="input"
              />
            </div>

            <div>
              <label htmlFor="login-password" className="label">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                required
                autoComplete="current-password"
                value={form.password}
                onChange={set("password")}
                placeholder="••••••••"
                className="input"
              />
            </div>

            <button type="submit" disabled={busy} className="btn-primary w-full">
              {busy ? (
                <Loader2 size={16} className="animate-spin" aria-hidden="true" />
              ) : (
                <LogIn size={16} aria-hidden="true" />
              )}
              Sign in
            </button>
          </form>

          <div className="my-5 flex items-center gap-3" aria-hidden="true">
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <button type="button" onClick={handleGoogle} disabled={busy} className="btn-outline w-full">
            <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84Z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.46 14.97.5 12 .5A11 11 0 0 0 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.14 6.16-4.14Z"
              />
            </svg>
            Continue with Google
          </button>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            New to Layan?{" "}
            <Link href="/register" className="font-semibold text-accent hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      ) : (
        <form onSubmit={handleBackend} className="card">
          <p className="mb-5 rounded-xl bg-muted px-4 py-3 text-xs leading-relaxed text-muted-foreground">
            Signing in as <strong className="text-primary">{selectedRole}</strong>. The role is sent to the
            API, which looks for your account in that role&apos;s records — so pick the tab that matches how
            you registered.
          </p>

          <div className="space-y-4">
            <div>
              <label htmlFor="backend-email" className="label">
                Email
              </label>
              <input
                id="backend-email"
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={set("email")}
                placeholder="you@yourbusiness.co.uk"
                className="input"
              />
            </div>

            <div>
              <label htmlFor="backend-password" className="label">
                Password
              </label>
              <input
                id="backend-password"
                type="password"
                required
                autoComplete="current-password"
                value={form.password}
                onChange={set("password")}
                placeholder="••••••••"
                className="input"
              />
            </div>

            {/* The backend requires `role` in the body; a hidden field keeps it
                in the DOM without duplicating the state. */}
            <input type="hidden" name="role" value={selectedRole} />

            <button type="submit" disabled={busy} className="btn-primary w-full">
              {busy ? (
                <Loader2 size={16} className="animate-spin" aria-hidden="true" />
              ) : (
                <LogIn size={16} aria-hidden="true" />
              )}
              Sign in as {selectedRole}
            </button>
          </div>

          {selectedRole === "owner" && (
            <p className="mt-6 text-center text-sm text-muted-foreground">
              No business account yet?{" "}
              <Link href="/register?role=owner" className="font-semibold text-accent hover:underline">
                List your business
              </Link>
            </p>
          )}

          {selectedRole === "staff" && (
            <p className="mt-4 rounded-xl bg-muted px-4 py-3 text-xs leading-relaxed text-muted-foreground">
              Staff accounts are created by a business owner from their dashboard, using the email address you
              sign in with.
            </p>
          )}

          {selectedRole === "admin" && (
            <p className="mt-4 rounded-xl bg-muted px-4 py-3 text-xs leading-relaxed text-muted-foreground">
              The API has no admin sign-up endpoint. An admin account is inserted directly into MongoDB —
              see the README.
            </p>
          )}
        </form>
      )}

      <p className={classNames("mt-6 text-center text-xs text-muted-foreground")}>
        By continuing you agree to our{" "}
        <Link href="/terms" className="underline hover:text-accent">
          terms
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="underline hover:text-accent">
          privacy policy
        </Link>
        .
      </p>
    </>
  );
}
