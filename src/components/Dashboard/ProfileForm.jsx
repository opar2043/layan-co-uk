"use client";

import { useState } from "react";
import { Loader2, Save, Plus, X } from "lucide-react";
import { classNames } from "@/lib/utils";

/**
 * Shared editable-profile pattern.
 *
 * `fields` drives the whole form so each role's profile page only declares its own
 * schema. A field is either a primitive (text/email/tel/number/textarea/select/
 * checkbox) or `{ type: "tags", value: string[] }` for string arrays.
 *
 * The form is deliberately uncontrolled-per-render with local draft state: nothing
 * is sent until Save, so a half-finished edit never hits the API.
 */
export default function ProfileForm({
  fields,
  initialValues = {},
  onSubmit,
  submitLabel = "Save changes",
  isPending = false,
  children,
}) {
  const [draft, setDraft] = useState({ ...initialValues });
  const [tagDraft, setTagDraft] = useState({});

  const set = (key) => (event) => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const setTags = (key) => (next) =>
    setDraft((prev) => ({ ...prev, [key]: Array.isArray(next) ? next : [] }));

  const addTag = (key) => {
    const value = (tagDraft[key] ?? "").trim();
    if (!value) return;
    const current = draft[key] ?? [];
    if (current.includes(value)) return;
    setTags(key)([...current, value]);
    setTagDraft((prev) => ({ ...prev, [key]: "" }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    // Strip empty strings so the API sees "not provided" rather than "".
    const payload = Object.fromEntries(
      Object.entries(draft).filter(([, value]) => value !== "" && value !== undefined)
    );
    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        {fields.map((field) => {
          const value = draft[field.key];
          const inputId = `field-${field.key}`;
          const describedBy = field.hint ? `${inputId}-hint` : undefined;
          const full = field.full || field.type === "textarea";

          if (field.type === "tags") {
            const tags = Array.isArray(value) ? value : [];
            return (
              <div key={field.key} className={full ? "sm:col-span-2" : ""}>
                <label htmlFor={inputId} className="label">
                  {field.label}
                </label>
                <ul className="mb-2.5 flex flex-wrap gap-2">
                  {tags.length === 0 && <li className="text-xs text-muted-foreground">None yet</li>}
                  {tags.map((tag) => (
                    <li
                      key={tag}
                      className="inline-flex items-center gap-1.5 rounded-full bg-accent-light px-3 py-1.5 text-xs font-medium text-accent"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => setTags(field.key)(tags.filter((entry) => entry !== tag))}
                        className="rounded-full p-0.5 hover:bg-accent hover:text-white"
                        aria-label={`Remove ${tag}`}
                      >
                        <X size={11} aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="flex gap-2">
                  <input
                    id={inputId}
                    type="text"
                    value={tagDraft[field.key] ?? ""}
                    onChange={(event) =>
                      setTagDraft((prev) => ({ ...prev, [field.key]: event.target.value }))
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        addTag(field.key);
                      }
                    }}
                    placeholder={field.placeholder ?? "Type and press Enter"}
                    className="input py-2.5 text-sm"
                    aria-describedby={describedBy}
                  />
                  <button
                    type="button"
                    onClick={() => addTag(field.key)}
                    className="btn-outline btn-sm shrink-0"
                  >
                    <Plus size={14} aria-hidden="true" />
                    Add
                  </button>
                </div>
                {field.hint && (
                  <p id={describedBy} className="hint mt-1.5">
                    {field.hint}
                  </p>
                )}
              </div>
            );
          }

          if (field.type === "checkbox") {
            return (
              <div key={field.key} className={full ? "sm:col-span-2" : ""}>
                <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-border bg-surface px-4 py-3.5">
                  <span>
                    <span className="block text-sm font-semibold">{field.label}</span>
                    {field.hint && <span className="mt-0.5 block text-xs text-muted-foreground">{field.hint}</span>}
                  </span>
                  <input
                    id={inputId}
                    type="checkbox"
                    checked={Boolean(value)}
                    onChange={set(field.key)}
                    className="h-5 w-5 shrink-0 rounded accent-[#8B5E3C]"
                  />
                </label>
              </div>
            );
          }

          if (field.type === "select") {
            return (
              <div key={field.key} className={full ? "sm:col-span-2" : ""}>
                <label htmlFor={inputId} className="label">
                  {field.label}
                </label>
                <select
                  id={inputId}
                  required={field.required}
                  value={value ?? ""}
                  onChange={set(field.key)}
                  className="input"
                  aria-describedby={describedBy}
                >
                  {field.placeholder && <option value="">{field.placeholder}</option>}
                  {(field.options ?? []).map((option) => {
                    const optionValue = typeof option === "string" ? option : option.value;
                    const optionLabel = typeof option === "string" ? option : option.label;
                    return (
                      <option key={optionValue} value={optionValue}>
                        {optionLabel}
                      </option>
                    );
                  })}
                </select>
                {field.hint && (
                  <p id={describedBy} className="hint mt-1.5">
                    {field.hint}
                  </p>
                )}
              </div>
            );
          }

          if (field.type === "textarea") {
            return (
              <div key={field.key} className="sm:col-span-2">
                <label htmlFor={inputId} className="label">
                  {field.label}
                </label>
                <textarea
                  id={inputId}
                  rows={field.rows ?? 4}
                  required={field.required}
                  maxLength={field.maxLength}
                  value={value ?? ""}
                  onChange={set(field.key)}
                  placeholder={field.placeholder}
                  className="input resize-y"
                  aria-describedby={describedBy}
                />
                {field.hint && (
                  <p id={describedBy} className="hint mt-1.5">
                    {field.hint}
                  </p>
                )}
              </div>
            );
          }

          return (
            <div key={field.key} className={full ? "sm:col-span-2" : ""}>
              <label htmlFor={inputId} className="label">
                {field.label}
              </label>
              <input
                id={inputId}
                type={field.type ?? "text"}
                required={field.required}
                min={field.min}
                max={field.max}
                step={field.step}
                value={value ?? ""}
                onChange={set(field.key)}
                placeholder={field.placeholder}
                className={classNames("input", field.type === "number" && "tabular-nums")}
                aria-describedby={describedBy}
              />
              {field.hint && (
                <p id={describedBy} className="hint mt-1.5">
                  {field.hint}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {children}

      <div className="flex justify-end border-t border-border pt-5">
        <button type="submit" disabled={isPending} className="btn-primary">
          {isPending ? (
            <Loader2 size={15} className="animate-spin" aria-hidden="true" />
          ) : (
            <Save size={15} aria-hidden="true" />
          )}
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
