"use client";

import { useState } from "react";
import { Scissors, Store, UserCog, ShieldCheck } from "lucide-react";
import { classNames } from "@/lib/utils";

export const ROLES = [
  { id: "customer", label: "Customer", icon: Scissors, hint: "Book with salons" },
  { id: "owner", label: "Business Owner", icon: Store, hint: "Manage a listing" },
  { id: "staff", label: "Staff", icon: UserCog, hint: "View your calendar" },
  { id: "admin", label: "Admin", icon: ShieldCheck, hint: "Platform operations" },
];

/**
 * Customer / Business Owner / Staff / Admin pill switcher.
 *
 * The active tab is the only thing the form needs to know which auth system to
 * use: `customer` goes through Firebase, the other three go through the backend
 * with the role posted as a hidden field.
 */
export default function RoleToggle({ value, onChange, className }) {
  const [active, setActive] = useState(value);

  // Keep in step when the parent drives the value (e.g. a ?role= query param).
  if (value !== active) setActive(value);

  return (
    <div
      className={classNames(
        "grid grid-cols-2 gap-1 rounded-2xl bg-muted p-1 sm:grid-cols-4",
        className
      )}
      role="tablist"
      aria-label="Choose how to sign in"
    >
      {ROLES.map(({ id, label, icon: Icon }) => {
        const selected = active === id;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => {
              setActive(id);
              onChange(id);
            }}
            className={classNames(
              "flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all sm:text-sm",
              selected
                ? "bg-surface text-primary shadow-card"
                : "text-muted-foreground hover:text-primary"
            )}
          >
            <Icon size={16} className={selected ? "text-accent" : ""} aria-hidden="true" />
            <span className="truncate">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
