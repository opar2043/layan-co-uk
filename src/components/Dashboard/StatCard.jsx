"use client";

import Link from "next/link";
import { TrendingUp, TrendingDown } from "lucide-react";
import { classNames } from "@/lib/utils";

const TONES = {
  default: "bg-surface",
  accent: "bg-accent-light",
  success: "bg-success/10",
  warning: "bg-warning/10",
  danger: "bg-danger/10",
};

/** One metric tile. `delta` renders as a green/red trend indicator. */
export default function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
  delta,
  href,
}) {
  const Wrapper = href ? Link : "div";
  const positive = typeof delta === "number" && delta >= 0;

  return (
    <Wrapper
      {...(href ? { href } : {})}
      className={classNames(
        "block rounded-2xl p-5 shadow-card transition-shadow",
        TONES[tone] ?? TONES.default,
        href && "hover:shadow-card-hover"
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
        {Icon && (
          <span className="shrink-0 rounded-lg bg-surface/80 p-1.5 text-accent">
            <Icon size={15} aria-hidden="true" />
          </span>
        )}
      </div>

      <p className="text-2xl font-bold tabular-nums sm:text-3xl">{value}</p>

      <div className="mt-2 flex items-center gap-2">
        {typeof delta === "number" && (
          <span
            className={classNames(
              "inline-flex items-center gap-1 text-xs font-semibold",
              positive ? "text-success" : "text-danger"
            )}
          >
            {positive ? (
              <TrendingUp size={13} aria-hidden="true" />
            ) : (
              <TrendingDown size={13} aria-hidden="true" />
            )}
            {positive ? "+" : ""}
            {delta}
            {typeof delta === "number" && <span className="sr-only"> percent</span>}
          </span>
        )}
        {hint && <p className="truncate text-xs text-muted-foreground">{hint}</p>}
      </div>
    </Wrapper>
  );
}
