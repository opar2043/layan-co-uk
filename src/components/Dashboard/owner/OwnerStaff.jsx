"use client";

import { useEffect, useState } from "react";
import { Users, Plus, Pencil, Trash2, Loader2, X, KeyRound } from "lucide-react";
import { useStaff, useCreateStaff, useUpdateStaff, useDeleteStaff } from "@/hooks/useStaff";
import { useServices } from "@/hooks/useServices";
import StatusBadge from "@/components/Public/StatusBadge";
import EmptyState from "@/components/Public/EmptyState";
import { classNames, titleCase } from "@/lib/utils";
import { STAFF_PERMISSION_LEVELS } from "@/lib/constants";

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

const BLANK = {
  name: "",
  email: "",
  password: "",
  permissionLevel: "standard",
  commissionRate: 0,
  isActive: true,
  servicesOffered: [],
  workingHours: [],
};

const PERMISSION_HELP = {
  view_only: "Can see the calendar but cannot change bookings.",
  standard: "Can manage their own bookings and reply to messages.",
  manager: "Everything a standard member can do, plus the full calendar.",
};

/** Names out of a populated `servicesOffered` array (falls back to raw ids). */
function serviceNames(entries) {
  return entries.map((entry) =>
    typeof entry === "string" ? entry : (entry?.name ?? entry?._id ?? "Service")
  );
}

/** Weekday grid of opening hours for one staff member. */
function WorkingHoursEditor({ hours, onChange }) {
  const byDay = Object.fromEntries(
    DAYS.map((day) => [day, hours.find((entry) => entry.day === day) ?? { day, start: "", end: "" }])
  );

  const update = (day, key, value) => {
    const next = DAYS.map((entryDay) => {
      const current = byDay[entryDay];
      if (entryDay !== day) return current.start && current.end ? current : null;
      return { day: entryDay, start: key === "start" ? value : current.start, end: key === "end" ? value : current.end };
    }).filter(Boolean);
    onChange(next);
  };

  return (
    <div className="space-y-2">
      {DAYS.map((day) => (
        <div key={day} className="flex items-center gap-3">
          <span className="w-24 shrink-0 text-sm capitalize text-muted-foreground">{day}</span>
          <label className="sr-only" htmlFor={`${day}-start`}>
            {day} start time
          </label>
          <input
            id={`${day}-start`}
            type="time"
            value={byDay[day].start}
            onChange={(event) => update(day, "start", event.target.value)}
            className="input py-2 text-sm"
          />
          <span aria-hidden="true" className="text-muted-foreground">
            –
          </span>
          <label className="sr-only" htmlFor={`${day}-end`}>
            {day} end time
          </label>
          <input
            id={`${day}-end`}
            type="time"
            value={byDay[day].end}
            onChange={(event) => update(day, "end", event.target.value)}
            className="input py-2 text-sm"
          />
        </div>
      ))}
      <p className="text-xs text-muted-foreground">Leave a day blank if they do not work then.</p>
    </div>
  );
}

/**
 * The API returns `servicesOffered` populated (objects), but both the form's
 * checkbox state and the PATCH body need bare ids, so they are unwrapped here.
 */
function toFormValues(member) {
  return {
    ...member,
    servicesOffered: (member.servicesOffered ?? [])
      .map((entry) => (typeof entry === "string" ? entry : entry?._id))
      .filter(Boolean),
  };
}

/** Create / edit form. `editing` null means "create a new staff member". */
function StaffForm({ editing, services, onClose }) {
  const create = useCreateStaff();
  const update = useUpdateStaff();
  const [draft, setDraft] = useState(editing ? toFormValues(editing) : { ...BLANK });

  useEffect(() => {
    setDraft(editing ? toFormValues(editing) : { ...BLANK });
  }, [editing]);

  const set = (key) => (event) => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const toggleService = (serviceId) =>
    setDraft((prev) => ({
      ...prev,
      servicesOffered: prev.servicesOffered.includes(serviceId)
        ? prev.servicesOffered.filter((entry) => entry !== serviceId)
        : [...prev.servicesOffered, serviceId],
    }));

  const submit = async (event) => {
    event.preventDefault();
    const payload = {
      name: draft.name,
      email: draft.email,
      permissionLevel: draft.permissionLevel,
      commissionRate: Number(draft.commissionRate) || 0,
      isActive: Boolean(draft.isActive),
      servicesOffered: draft.servicesOffered,
      workingHours: draft.workingHours,
    };
    try {
      if (editing?._id) {
        await update.mutateAsync({ id: editing._id, ...payload });
      } else {
        // The password is only accepted on create, and never returned afterwards.
        await create.mutateAsync({ ...payload, password: draft.password });
      }
      onClose();
    } catch {
      /* the mutation raises its own toast */
    }
  };

  const isPending = create.isPending || update.isPending;

  return (
    <form onSubmit={submit} className="mb-6 rounded-2xl bg-surface p-5 shadow-card sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-lg">{editing ? `Edit ${editing.name}` : "Add a staff member"}</h2>
        <button type="button" onClick={onClose} className="btn-ghost btn-sm" aria-label="Close form">
          <X size={16} aria-hidden="true" />
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="staff-name" className="label">
            Full name
          </label>
          <input
            id="staff-name"
            type="text"
            required
            minLength={2}
            maxLength={120}
            value={draft.name}
            onChange={set("name")}
            className="input"
          />
        </div>

        <div>
          <label htmlFor="staff-email" className="label">
            Email
          </label>
          <input
            id="staff-email"
            type="email"
            required
            value={draft.email}
            onChange={set("email")}
            className="input"
          />
          <p className="hint mt-1.5">This is the address they sign in with.</p>
        </div>

        {!editing && (
          <div className="sm:col-span-2">
            <label htmlFor="staff-password" className="label">
              Temporary password
            </label>
            <input
              id="staff-password"
              type="password"
              required
              minLength={8}
              value={draft.password}
              onChange={set("password")}
              placeholder="At least 8 characters"
              className="input"
            />
            <p className="hint mt-1.5">
              Share it with them securely. The API stores only a hash and never returns it.
            </p>
          </div>
        )}

        <div>
          <label htmlFor="staff-permission" className="label">
            Permission level
          </label>
          <select
            id="staff-permission"
            value={draft.permissionLevel}
            onChange={set("permissionLevel")}
            className="input"
          >
            {STAFF_PERMISSION_LEVELS.map((level) => (
              <option key={level} value={level}>
                {titleCase(level)}
              </option>
            ))}
          </select>
          <p className="hint mt-1.5">{PERMISSION_HELP[draft.permissionLevel]}</p>
        </div>

        <div>
          <label htmlFor="staff-commission" className="label">
            Commission rate (%)
          </label>
          <input
            id="staff-commission"
            type="number"
            min={0}
            max={100}
            step="0.5"
            value={draft.commissionRate}
            onChange={set("commissionRate")}
            className="input tabular-nums"
          />
        </div>

        {services.length > 0 && (
          <fieldset className="sm:col-span-2">
            <legend className="label">Services they offer</legend>
            <p className="hint mb-2.5">Leave all unticked to let them take any service.</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {services.map((service) => (
                <label
                  key={service._id}
                  className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-border px-3.5 py-2.5 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={draft.servicesOffered.includes(service._id)}
                    onChange={() => toggleService(service._id)}
                    className="h-4 w-4 rounded accent-[#8B5E3C]"
                  />
                  {service.name}
                </label>
              ))}
            </div>
          </fieldset>
        )}

        <div className="sm:col-span-2">
          <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-border px-4 py-3">
            <span>
              <span className="block text-sm font-semibold">Active</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                Inactive staff cannot sign in.
              </span>
            </span>
            <input
              type="checkbox"
              checked={Boolean(draft.isActive)}
              onChange={set("isActive")}
              className="h-5 w-5 shrink-0 rounded accent-[#8B5E3C]"
            />
          </label>
        </div>

        <div className="sm:col-span-2">
          <p className="label">Working hours</p>
          <p className="hint mb-3">
            Set these now, or let them edit their own hours from their dashboard.
          </p>
          <WorkingHoursEditor
            hours={draft.workingHours}
            onChange={(hours) => setDraft((prev) => ({ ...prev, workingHours: hours }))}
          />
        </div>
      </div>

      <div className="mt-5 flex justify-end gap-3 border-t border-border pt-5">
        <button type="button" onClick={onClose} className="btn-ghost">
          Cancel
        </button>
        <button type="submit" disabled={isPending} className="btn-primary">
          {isPending && <Loader2 size={15} className="animate-spin" aria-hidden="true" />}
          {editing ? "Save changes" : "Create staff account"}
        </button>
      </div>
    </form>
  );
}

export default function OwnerStaff() {
  const { data, isLoading, error } = useStaff();
  const { data: serviceData } = useServices();
  const remove = useDeleteStaff();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const staff = data?.staff ?? data?.items ?? [];
  const services = serviceData?.items ?? serviceData?.services ?? [];

  if (error) {
    return <EmptyState icon={Users} title="Could not load your team" description={error.message} />;
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl">Staff</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Team members who can take bookings on your behalf.
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
          Add staff
        </button>
      </header>

      {formOpen && <StaffForm editing={editing} services={services} onClose={() => setFormOpen(false)} />}

      {isLoading ? (
        <div className="space-y-3" aria-busy="true">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="skeleton h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : staff.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No staff yet"
          description="Add a team member so they can take bookings and reply to messages on your behalf. They sign in with the email you set here."
          action={
            <button type="button" onClick={() => setFormOpen(true)} className="btn-primary btn-sm">
              <Plus size={15} aria-hidden="true" />
              Add your first team member
            </button>
          }
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {staff.map((member) => (
            <li key={member._id} className="rounded-2xl bg-surface p-5 shadow-card">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate font-semibold">{member.name}</h3>
                  <p className="truncate text-sm text-muted-foreground">{member.email}</p>
                </div>
                <StatusBadge
                  status={member.isActive ? "approved" : "rejected"}
                  label={member.isActive ? "Active" : "Inactive"}
                />
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <StatusBadge status={member.permissionLevel} label={titleCase(member.permissionLevel)} />
                {Number(member.commissionRate) > 0 && (
                  <span className="chip">{member.commissionRate}% commission</span>
                )}
                {/* servicesOffered arrives populated, so the names are available. */}
                {Array.isArray(member.servicesOffered) && member.servicesOffered.length > 0 && (
                  <span className="chip" title={serviceNames(member.servicesOffered).join(", ")}>
                    {serviceNames(member.servicesOffered).slice(0, 2).join(", ")}
                    {member.servicesOffered.length > 2
                      ? ` +${member.servicesOffered.length - 2}`
                      : ""}
                  </span>
                )}
              </div>

              <div className="mt-4 flex gap-2 border-t border-border pt-3.5">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(member);
                    setFormOpen(true);
                  }}
                  className="btn-outline btn-sm"
                >
                  <Pencil size={13} aria-hidden="true" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (
                      window.confirm(
                        `Remove ${member.name}? They will lose access immediately. Their past bookings are kept.`
                      )
                    ) {
                      remove.mutate(member._id);
                    }
                  }}
                  disabled={remove.isPending}
                  className={classNames("btn-ghost btn-sm", "text-danger")}
                >
                  <Trash2 size={13} aria-hidden="true" />
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="flex items-start gap-2 rounded-xl bg-muted px-4 py-3 text-xs leading-relaxed text-muted-foreground">
        <KeyRound size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
        Staff can only edit their own working hours and time off. Everything else on their account is
        yours to manage.
      </p>
    </div>
  );
}
