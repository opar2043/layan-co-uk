import { Inbox } from "lucide-react";

/**
 * Empty state. Every list in the app gets one of these rather than a blank
 * region — an empty dashboard should still explain what to do next.
 */
export default function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className = "",
  compact = false,
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface/50 text-center ${
        compact ? "px-6 py-10" : "px-6 py-16"
      } ${className}`}
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-light">
        <Icon size={22} className="text-accent" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
