"use client";

import { useEffect, useState } from "react";
import { Scissors, Plus, Pencil, Trash2, Loader2, X } from "lucide-react";
import {
  useServices, useCreateService, useUpdateService, useDeleteService,
} from "@/hooks/useServices";
import StatusBadge from "@/components/Public/StatusBadge";
import EmptyState from "@/components/Public/EmptyState";
import { formatCurrency } from "@/lib/utils";
import { CATEGORIES } from "@/lib/constants";

const BLANK = {
  name: "",
  category: CATEGORIES[0],
  description: "",
  durationMinutes: 30,
  price: 0,
  bufferMinutes: 0,
  leadTimeHours: 0,
  cancellationWindowHours: 24,
  isInstantBook: true,
  requiresConsultationForm: false,
  isActive: true,
};

const NUMERIC = [
  { key: "durationMinutes", label: "Duration (min)", min: 5, max: 600, step: 5, hint: "5–600" },
  { key: "price", label: "Price", min: 0, step: 1, hint: "In pounds" },
  { key: "bufferMinutes", label: "Buffer (min)", min: 0, max: 240, step: 5, hint: "Gap after each appointment" },
  { key: "leadTimeHours", label: "Lead time (h)", min: 0, max: 720, step: 1, hint: "How far ahead customers must book" },
  { key: "cancellationWindowHours", label: "Free cancel (h)", min: 0, max: 720, step: 1, hint: "Cutoff before the appointment" },
];

const TOGGLES = [
  { key: "isInstantBook", label: "Instant booking", hint: "Customers can book without waiting for you." },
  { key: "requiresConsultationForm", label: "Consultation form", hint: "Customers must answer questions first." },
  { key: "isActive", label: "Active", hint: "Inactive services are hidden from customers." },
];

/** Create / edit form. `editing` null means "create a new service". */
function ServiceForm({ editing, onClose }) {
  const create = useCreateService();
  const update = useUpdateService();
  const [draft, setDraft] = useState(editing ? { ...editing } : { ...BLANK });

  useEffect(() => {
    setDraft(editing ? { ...editing } : { ...BLANK });
  }, [editing]);

  const set = (key) => (event) => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    const payload = {
      ...draft,
      durationMinutes: Number(draft.durationMinutes),
      price: Number(draft.price),
      bufferMinutes: Number(draft.bufferMinutes),
      leadTimeHours: Number(draft.leadTimeHours),
      cancellationWindowHours: Number(draft.cancellationWindowHours),
    };
    try {
      if (editing?._id) {
        const { _id, businessId, ...rest } = payload;
        await update.mutateAsync({ id: _id, ...rest });
      } else {
        await create.mutateAsync(payload);
      }
      onClose();
    } catch {
      /* the mutation raises its own toast */
    }
  };

  const isPending = create.isPending || update.isPending;

  return (
    <form
      onSubmit={submit}
      className="mb-6 rounded-2xl bg-surface p-5 shadow-card sm:p-6"
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-lg">{editing ? "Edit service" : "New service"}</h2>
        <button type="button" onClick={onClose} className="btn-ghost btn-sm" aria-label="Close form">
          <X size={16} aria-hidden="true" />
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="service-name" className="label">
            Name
          </label>
          <input
            id="service-name"
            type="text"
            required
            minLength={2}
            maxLength={150}
            value={draft.name}
            onChange={set("name")}
            placeholder="Classic cut & finish"
            className="input"
          />
        </div>

        <div>
          <label htmlFor="service-category" className="label">
            Category
          </label>
          <select
            id="service-category"
            required
            value={draft.category}
            onChange={set("category")}
            className="input"
          >
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {NUMERIC.map((field) => (
          <div key={field.key}>
            <label htmlFor={`service-${field.key}`} className="label">
              {field.label}
            </label>
            <input
              id={`service-${field.key}`}
              type="number"
              required
              min={field.min}
              max={field.max}
              step={field.step}
              value={draft[field.key]}
              onChange={set(field.key)}
              className="input tabular-nums"
            />
            <p className="hint mt-1.5">{field.hint}</p>
          </div>
        ))}

        <div className="sm:col-span-2">
          <label htmlFor="service-description" className="label">
            Description
          </label>
          <textarea
            id="service-description"
            rows={3}
            maxLength={2000}
            value={draft.description ?? ""}
            onChange={set("description")}
            placeholder="What is included in this service?"
            className="input resize-y"
          />
        </div>

        {TOGGLES.map((toggle) => (
          <div key={toggle.key} className="sm:col-span-2">
            <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-border px-4 py-3">
              <span>
                <span className="block text-sm font-semibold">{toggle.label}</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">{toggle.hint}</span>
              </span>
              <input
                type="checkbox"
                checked={Boolean(draft[toggle.key])}
                onChange={set(toggle.key)}
                className="h-5 w-5 shrink-0 rounded accent-[#8B5E3C]"
              />
            </label>
          </div>
        ))}
      </div>

      <div className="mt-5 flex justify-end gap-3 border-t border-border pt-5">
        <button type="button" onClick={onClose} className="btn-ghost">
          Cancel
        </button>
        <button type="submit" disabled={isPending} className="btn-primary">
          {isPending && <Loader2 size={15} className="animate-spin" aria-hidden="true" />}
          {editing ? "Save changes" : "Create service"}
        </button>
      </div>
    </form>
  );
}

function ServiceRow({ service, onEdit, onDelete, isDeleting }) {
  return (
    <li className="flex flex-wrap items-center gap-4 rounded-xl border border-border px-4 py-3.5">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-semibold">{service.name}</h3>
          <StatusBadge status={service.isActive ? "approved" : "rejected"} label={service.isActive ? "Active" : "Hidden"} />
          {service.isInstantBook && <StatusBadge status="instant_book" label="Instant book" />}
        </div>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {service.category} · {service.durationMinutes} min
          {service.bufferMinutes > 0 && ` + ${service.bufferMinutes} min buffer`}
        </p>
        {service.description && (
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{service.description}</p>
        )}
      </div>

      <p className="text-lg font-bold text-accent tabular-nums">{formatCurrency(service.price)}</p>

      <div className="flex gap-1.5">
        <button type="button" onClick={() => onEdit(service)} className="btn-ghost btn-sm" aria-label={`Edit ${service.name}`}>
          <Pencil size={14} aria-hidden="true" />
          Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(service)}
          disabled={isDeleting}
          className="btn-ghost btn-sm text-danger"
          aria-label={`Delete ${service.name}`}
        >
          <Trash2 size={14} aria-hidden="true" />
        </button>
      </div>
    </li>
  );
}

export default function OwnerServices() {
  // No businessId: the API resolves the owner's own business from the JWT, and an
  // owner is the only role that sees deactivated services.
  const { data, isLoading, error } = useServices();
  const remove = useDeleteService();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const services = data?.items ?? data?.services ?? [];

  if (error) {
    return <EmptyState icon={Scissors} title="Could not load services" description={error.message} />;
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl">Services</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            What customers can book, and for how long.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
          className="btn-primary btn-sm"
        >
          <Plus size={15} aria-hidden="true" />
          New service
        </button>
      </header>

      {formOpen && (
        <ServiceForm editing={editing} onClose={() => setFormOpen(false)} />
      )}

      {isLoading ? (
        <div className="space-y-3" aria-busy="true">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="skeleton h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : services.length === 0 ? (
        <EmptyState
          icon={Scissors}
          title="No services yet"
          description="Add your first service so customers can book with you. Each service needs a name, category, duration and price."
          action={
            <button
              type="button"
              onClick={() => setFormOpen(true)}
              className="btn-primary btn-sm"
            >
              <Plus size={15} aria-hidden="true" />
              Add a service
            </button>
          }
        />
      ) : (
        <ul className="space-y-3">
          {services.map((service) => (
            <ServiceRow
              key={service._id}
              service={service}
              isDeleting={remove.isPending}
              onEdit={(item) => {
                setEditing(item);
                setFormOpen(true);
              }}
              onDelete={(item) => {
                // Services are soft-deleted, so the row only disappears from
                // customers' view — the record stays for existing bookings.
                if (window.confirm(`Delete "${item.name}"? Existing bookings are not affected.`)) {
                  remove.mutate(item._id);
                }
              }}
            />
          ))}
        </ul>
      )}

    </div>
  );
}
