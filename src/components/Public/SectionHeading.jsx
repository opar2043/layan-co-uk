import { classNames } from "@/lib/utils";

/** Section title + optional lede and right-hand action. */
export default function SectionHeading({ eyebrow, title, description, action, align = "left", className }) {
  return (
    <div
      className={classNames(
        "mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        align === "center" && "sm:flex-col sm:items-center sm:text-center",
        className
      )}
    >
      <div className={classNames("max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow && (
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-accent">
            {eyebrow}
          </p>
        )}
        <h2 className="text-2xl sm:text-3xl">{title}</h2>
        {description && (
          <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
