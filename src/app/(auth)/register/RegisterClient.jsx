"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, UserPlus } from "lucide-react";
import toast from "react-hot-toast";
import RoleToggle from "@/components/Auth/RoleToggle";
import useAuth from "@/components/Auth/useAuth";
import { CATEGORIES } from "@/lib/constants";
import { isEmail } from "@/lib/utils";

const CUSTOMER_EMPTY = { name: "", email: "", password: "", confirm: "" };
const OWNER_EMPTY = {
  ownerName: "",
  businessName: "",
  email: "",
  password: "",
  category: CATEGORIES[0],
  address: "",
  city: "",
  description: "",
};

export default function RegisterClient() {
  const router = useRouter();
  const params = useSearchParams();
  const { isAuthenticated, role, isLoading, registerCustomer, registerOwner } = useAuth();

  const [mode, setMode] = useState("customer");
  const [customer, setCustomer] = useState(CUSTOMER_EMPTY);
  const [owner, setOwner] = useState(OWNER_EMPTY);
  const [busy, setBusy] = useState(false);

  const requestedRole = params.get("role");
  useEffect(() => {
    if (requestedRole === "owner") setMode("owner");
  }, [requestedRole]);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(`/dashboard/${role}`);
    }
  }, [isAuthenticated, isLoading, role, router]);

  const setCustomerField = (key) => (event) =>
    setCustomer((prev) => ({ ...prev, [key]: event.target.value }));
  const setOwnerField = (key) => (event) =>
    setOwner((prev) => ({ ...prev, [key]: event.target.value }));

  const submitCustomer = async (event) => {
    event.preventDefault();
    if (customer.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (customer.password !== customer.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    setBusy(true);
    try {
      await registerCustomer({
        name: customer.name.trim(),
        email: customer.email.trim(),
        password: customer.password,
      });
      toast.success("Account created");
      router.push("/dashboard/customer");
    } catch (error) {
      const code = error?.code ?? "";
      toast.error(
        code === "auth/email-already-in-use"
          ? "An account already exists for that email"
          : code === "auth/weak-password"
            ? "That password is too weak — use at least 6 characters"
            : error?.message || "Could not create your account"
      );
    } finally {
      setBusy(false);
    }
  };

  const submitOwner = async (event) => {
    event.preventDefault();
    if (owner.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (!isEmail(owner.email)) {
      toast.error("Enter a valid business email address");
      return;
    }
    setBusy(true);
    try {
      await registerOwner({
        ownerName: owner.ownerName.trim(),
        businessName: owner.businessName.trim(),
        email: owner.email.trim(),
        password: owner.password,
        category: owner.category,
        // The API takes location.address / location.city as flat fields and nests
        // them itself.
        address: owner.address.trim(),
        city: owner.city.trim(),
        description: owner.description.trim() || undefined,
      });
      toast.success("Business created — awaiting verification");
      router.push("/dashboard/owner");
    } catch (error) {
      toast.error(error.message || "Could not create your business");
    } finally {
      setBusy(false);
    }
  };

  const isCustomerMode = mode === "customer";

  return (
    <>
      <h1 className="mb-2 text-3xl">Create your Layan account</h1>
      <p className="mb-7 text-sm text-muted-foreground">
        Book appointments as a customer, or list your salon, barber or nail bar.
      </p>

      <RoleToggle
        value={isCustomerMode ? "customer" : "owner"}
        onChange={(next) => setMode(next === "customer" ? "customer" : "owner")}
        className="mb-7"
      />

      {isCustomerMode ? (
        <form onSubmit={submitCustomer} className="card space-y-4">
          <div>
            <label htmlFor="reg-name" className="label">
              Full name
            </label>
            <input
              id="reg-name"
              type="text"
              required
              autoComplete="name"
              value={customer.name}
              onChange={setCustomerField("name")}
              placeholder="Alex Morgan"
              className="input"
            />
          </div>

          <div>
            <label htmlFor="reg-email" className="label">
              Email
            </label>
            <input
              id="reg-email"
              type="email"
              required
              autoComplete="email"
              value={customer.email}
              onChange={setCustomerField("email")}
              placeholder="you@example.com"
              className="input"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="reg-password" className="label">
                Password
              </label>
              <input
                id="reg-password"
                type="password"
                required
                autoComplete="new-password"
                value={customer.password}
                onChange={setCustomerField("password")}
                placeholder="At least 6 characters"
                className="input"
              />
            </div>
            <div>
              <label htmlFor="reg-confirm" className="label">
                Confirm password
              </label>
              <input
                id="reg-confirm"
                type="password"
                required
                autoComplete="new-password"
                value={customer.confirm}
                onChange={setCustomerField("confirm")}
                placeholder="Repeat your password"
                className="input"
              />
            </div>
          </div>

          <button type="submit" disabled={busy} className="btn-primary w-full">
            {busy ? (
              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
            ) : (
              <UserPlus size={16} aria-hidden="true" />
            )}
            Create account
          </button>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-accent hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      ) : (
        <form onSubmit={submitOwner} className="card space-y-4">
          <div className="rounded-xl bg-muted px-4 py-3 text-xs leading-relaxed text-muted-foreground">
            Your listing is created as <strong className="text-primary">pending verification</strong> and
            stays out of public search until our team approves it. You can publish services and manage your
            calendar straight away.
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="owner-name" className="label">
                Your name
              </label>
              <input
                id="owner-name"
                type="text"
                required
                autoComplete="name"
                value={owner.ownerName}
                onChange={setOwnerField("ownerName")}
                placeholder="Alex Morgan"
                className="input"
              />
            </div>
            <div>
              <label htmlFor="owner-business" className="label">
                Business name
              </label>
              <input
                id="owner-business"
                type="text"
                required
                value={owner.businessName}
                onChange={setOwnerField("businessName")}
                placeholder="Morgan Hair Studio"
                className="input"
              />
            </div>
          </div>

          <div>
            <label htmlFor="owner-email" className="label">
              Business email
            </label>
            <input
              id="owner-email"
              type="email"
              required
              autoComplete="email"
              value={owner.email}
              onChange={setOwnerField("email")}
              placeholder="hello@yourbusiness.co.uk"
              className="input"
            />
            <p className="hint mt-1.5">
              This is the address staff will use to sign in, so keep it one you control.
            </p>
          </div>

          <div>
            <label htmlFor="owner-password" className="label">
              Password
            </label>
            <input
              id="owner-password"
              type="password"
              required
              autoComplete="new-password"
              value={owner.password}
              onChange={setOwnerField("password")}
              placeholder="At least 8 characters"
              className="input"
            />
          </div>

          <div>
            <label htmlFor="owner-category" className="label">
              Category
            </label>
            <select
              id="owner-category"
              required
              value={owner.category}
              onChange={setOwnerField("category")}
              className="input"
            >
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="owner-address" className="label">
                Address
              </label>
              <input
                id="owner-address"
                type="text"
                required
                autoComplete="street-address"
                value={owner.address}
                onChange={setOwnerField("address")}
                placeholder="14 Balsall Street"
                className="input"
              />
            </div>
            <div>
              <label htmlFor="owner-city" className="label">
                City
              </label>
              <input
                id="owner-city"
                type="text"
                required
                autoComplete="address-level2"
                value={owner.city}
                onChange={setOwnerField("city")}
                placeholder="Birmingham"
                className="input"
              />
            </div>
          </div>

          <div>
            <label htmlFor="owner-description" className="label">
              About your business <span className="font-normal text-muted-foreground">(optional)</span>
            </label>
            <textarea
              id="owner-description"
              rows={3}
              maxLength={2000}
              value={owner.description}
              onChange={setOwnerField("description")}
              placeholder="What you do, who you do it for, what makes you different."
              className="input resize-y"
            />
          </div>

          <button type="submit" disabled={busy} className="btn-primary w-full">
            {busy ? (
              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
            ) : (
              <UserPlus size={16} aria-hidden="true" />
            )}
            Create my business
          </button>

          <p className="text-center text-sm text-muted-foreground">
            Already listed?{" "}
            <Link href="/login?role=owner" className="font-semibold text-accent hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      )}
    </>
  );
}
