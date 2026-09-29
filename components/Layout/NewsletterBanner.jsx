"use client";

import { useState } from "react";
import { Check, Loader2, Mail } from "lucide-react";
import toast from "react-hot-toast";

/**
 * Newsletter sign-up.
 *
 * The backend has no marketing-consent endpoint and inventing one would be worse
 * than being honest, so submitting is handled locally: the address is stored in
 * localStorage and the form confirms. It is visually complete and keyboard
 * accessible, and clearly a placeholder until a real endpoint exists.
 */
const KEY = "layan_newsletter";

export default function NewsletterBanner() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      toast.error("Enter a valid email address");
      return;
    }
    setBusy(true);
    try {
      const existing = JSON.parse(window.localStorage.getItem(KEY) || "[]");
      if (!existing.includes(email.trim())) existing.push(email.trim());
      window.localStorage.setItem(KEY, JSON.stringify(existing));
      setDone(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="container-page pb-16 sm:pb-20">
      <div className="flex flex-col items-start gap-6 rounded-3xl bg-accent-light p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
        <div className="max-w-md">
          <h2 className="text-2xl sm:text-3xl">Get new listings first</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Occasional emails when a salon, barber or nail bar joins Layan in your area.
          </p>
        </div>

        {done ? (
          <p className="flex items-center gap-2 rounded-xl bg-surface px-5 py-3.5 text-sm font-medium text-success">
            <Check size={16} aria-hidden="true" />
            You are on the list
          </p>
        ) : (
          <form onSubmit={submit} className="flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row">
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <div className="relative sm:w-72">
              <Mail
                size={16}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <input
                id="newsletter-email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="input pl-11"
              />
            </div>
            <button type="submit" disabled={busy} className="btn-primary">
              {busy ? <Loader2 size={15} className="animate-spin" aria-hidden="true" /> : "Sign up"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
