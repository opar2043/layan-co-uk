"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

/**
 * Share/copy button.
 *
 * Lives in its own client component because the business page is a server
 * component for SEO — an inline `onClick` touching `navigator` cannot be
 * serialised across the server/client boundary.
 */
export default function ShareButton({ title }) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // The user dismissed the share sheet, or it failed — fall through to copy.
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable (insecure context) — nothing useful to do.
    }
  };

  return (
    <button type="button" onClick={share} className="btn-outline btn-sm w-full">
      {copied ? <Check size={14} aria-hidden="true" /> : <Share2 size={14} aria-hidden="true" />}
      {copied ? "Link copied" : "Share this listing"}
    </button>
  );
}
