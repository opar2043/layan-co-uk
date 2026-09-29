"use client";

import { useEffect, useState } from "react";
import { UserCog, Plus, Trash2, Clock, Loader2, Info } from "lucide-react";
import useAuth from "@/components/Auth/useAuth";
import { useStaffMember, useUpdateStaff } from "@/hooks/useStaff";
import { useServices } from "@/hooks/useServices";
import StatusBadge from "@/components/Public/StatusBadge";
import EmptyState from "@/components/Public/EmptyState";
import { combineDateTime, titleCase, toDateInput } from "@/lib/utils";

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

/**
 * Weekly availability.
 *
 * The API validates `workingHours` as an array of `{ day, start, end }` with
 * start/end capped at 5 characters, i.e. "HH:MM" — which is exactly what
 * `<input type="time">` produces.
 */
function WorkingHoursEditor({ hours, onChange }) {
  const byDay = Object.fromEntries(
    DAYS.map((day) => [day, hours.find((entry) => entry.day === day) ?? { day, start: "", end: "" }])
  );

  const update = (day, key, value) => {
    const next = DAYS.map((entryDay) => {
      const current = byDay[entryDay];
      // A day is only kept once it has both ends filled in.
      if (entryDay !== day) return current.start && current.end ? current : null;
      return {
        day: entryDay,
        start: key === "start" ? value : current.start,
        end: key === "end" ? value : current.end,
      };
    }).filter(Boolean);
    onChange(next);
  };

  return (
    <div className="space-y-2">
      {DAYS.map((day) => (
        <div key={day} className="flex items-center gap-3">
          <span className="w-24 shrink-0 text-sm capitalize text-muted-foreground">{day}</span>
          <label htmlFor={`${day}-start`} className="sr-only">
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
          <label htmlFor={`${day}-end`} className="sr-only">
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
      <p className="text-xs text-muted-foreground">Leave a day blank if you do not work then.</p>
    </div>
  );
}

/** Approved absences suppress bookings for that window. */
function TimeOffEditor({ entries, onChange }) {
  const [draft, setDraft] = useState({ startDate: "", startTime: "09:00", endDate: "", endTime: "17:00", reason: "" });

  const add = () => {
    if (!draft.startDate || !draft.endDate) return;
    onChange([
      ...entries,
      {
        start: combineDateTime(draft.startDate, draft.startTime),
        end: combineDateTime(draft.endDate, draft.endTime),
        ...(draft.reason.trim() ? { reason: draft.reason.trim() } : {}),
      },
    ]);
    setDraft({ startDate: "", startTime: "09:00", endDate: "", endTime: "17:00", reason: "" });
  };

  return (
    <div className="space-y-4">
      {entries.length > 0 && (
        <ul className="space-y-2">
          {entries.map((entry, index) => (
            <li
              key={`${entry.start}-${index}`}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium">
                  {new Date(entry.start).toLocaleString("en-GB", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
                <p className="text-xs text-muted-foreground">
                  to{" "}
                  {new Date(entry.end).toLocaleString("en-GB", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                  {entry.reason ? ` · ${entry.reason}` : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onChange(entries.filter((_, position) => position !== index))}
                className="btn-ghost btn-sm text-danger"
                aria-label="Remove time off"
              >
                <Trash2 size={13} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="rounded-xl bg-muted/60 p-4">
        <p className="mb-3 text-sm font-semibold">Add time off</p>
        <div className="grid gap-3 sm:grid-cols-4">
          <div>
            <label htmlFor="timeoff-start-date" className="label">
              From
            </label>
            <input
              id="timeoff-start-date"
              type="date"
              value={draft.startDate}
              min={toDateInput()}
              onChange={(event) => setDraft((prev) => ({ ...prev, startDate: event.target.value }))}
              className="input py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="timeoff-start-time" className="label">
              Start
            </label>
            <input
              id="timeoff-start-time"
              type="time"
              value={draft.startTime}
              onChange={(event) => setDraft((prev) => ({ ...prev, startTime: event.target.value }))}
              className="input py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="timeoff-end-date" className="label">
              To
            </label>
            <input
              id="timeoff-end-date"
              type="date"
              value={draft.endDate}
              min={draft.startDate || toDateInput()}
              onChange={(event) => setDraft((prev) => ({ ...prev, endDate: event.target.value }))}
              className="input py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="timeoff-end-time" className="label">
              End
            </label>
            <input
              id="timeoff-end-time"
              type="time"
              value={draft.endTime}
              onChange={(event) => setDraft((prev) => ({ ...prev, endTime: event.target.value }))}
              className="input py-2 text-sm"
            />
          </div>
        </div>

        <div className="mt-3">
          <label htmlFor="timeoff-reason" className="label">
            Reason <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <div className="flex gap-2">
            <input
              id="timeoff-reason"
              type="text"
              maxLength={200}
              value={draft.reason}
              onChange={(event) => setDraft((prev) => ({ ...prev, reason: event.target.value }))}
              placeholder="Holiday"
              className="input py-2 text-sm"
            />
            <button
              type="button"
              onClick={add}
              disabled={!draft.startDate || !draft.endDate}
              className="btn-outline btn-sm shrink-0"
            >
              <Plus size={14} aria-hidden="true" />
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StaffProfile() {
  const { user } = useAuth();
  // `GET /staff` is owner-only, but `GET /staff/:id` allows a staff member to read
  // their own record — and it is the one that populates `servicesOffered`.
  const staffId = user?._id;
  const { data, isLoading, error } = useStaffMember(staffId, { enabled: Boolean(staffId) });
  const { data: serviceData } = useServices();
  const update = useUpdateStaff();

  const staff = data?.staff ?? data;
  const services = serviceData?.items ?? [];

  const [hours, setHours] = useState([]);
  const [timeOff, setTimeOff] = useState([]);

  useEffect(() => {
    if (!staff) return;
    setHours(staff.workingHours ?? []);
    setTimeOff(staff.timeOff ?? []);
  }, [staff]);

  if (error) {
    return <EmptyState icon={UserCog} title="Could not load your profile" description={error.message} />;
  }

  if (isLoading) {
    return <div className="skeleton h-96 w-full rounded-2xl" aria-busy="true" />;
  }

  const serviceNames = (staff?.servicesOffered ?? []).map((entry) =>
    typeof entry === "string" ? entry : (entry?.name ?? "")
  );

  const save = async (payload) => {
    // Only workingHours and timeOff are editable by a staff member; every other
    // field is ignored by the API for this role, so none is sent.
    await update.mutateAsync({ id: staffId, ...payload });
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl sm:text-3xl">Your profile</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Set when you are available. Your business owner manages everything else.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          <section className="rounded-2xl bg-surface p-5 shadow-card sm:p-6">
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <Clock size={16} className="text-accent" aria-hidden="true" />
              Working hours
            </h2>
            <p className="mt-1 mb-5 text-xs leading-relaxed text-muted-foreground">
              Customers can only book you inside these hours. Changes apply as soon as you save.
            </p>

            <WorkingHoursEditor hours={hours} onChange={setHours} />

            <div className="mt-5 flex justify-end border-t border-border pt-4">
              <button
                type="button"
                onClick={() => save({ workingHours: hours })}
                disabled={update.isPending}
                className="btn-primary btn-sm"
              >
                {update.isPending && <Loader2 size={13} className="animate-spin" aria-hidden="true" />}
                Save hours
              </button>
            </div>
          </section>

          <section className="rounded-2xl bg-surface p-5 shadow-card sm:p-6">
            <h2 className="text-base font-semibold">Time off</h2>
            <p className="mt-1 mb-5 text-xs leading-relaxed text-muted-foreground">
              Approved absences stop new bookings for that window.
            </p>

            <TimeOffEditor entries={timeOff} onChange={setTimeOff} />

            <div className="mt-5 flex justify-end border-t border-border pt-4">
              <button
                type="button"
                onClick={() => save({ timeOff })}
                disabled={update.isPending}
                className="btn-primary btn-sm"
              >
                {update.isPending && <Loader2 size={13} className="animate-spin" aria-hidden="true" />}
                Save time off
              </button>
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl bg-surface p-5 shadow-card">
            <h2 className="text-base font-semibold">Your account</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-muted-foreground">Name</dt>
                <dd className="font-medium">{staff?.name ?? user?.name}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-muted-foreground">Email</dt>
                <dd className="truncate font-medium">{staff?.email ?? user?.email}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-muted-foreground">Permission</dt>
                <dd>
                  <StatusBadge
                    status={staff?.permissionLevel ?? "standard"}
                    label={titleCase(staff?.permissionLevel ?? "standard")}
                  />
                </dd>
              </div>
              {Number(staff?.commissionRate) > 0 && (
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-muted-foreground">Commission</dt>
                  <dd className="font-medium">{staff.commissionRate}%</dd>
                </div>
              )}
            </dl>
          </div>

          {serviceNames.length > 0 && (
            <div className="rounded-2xl bg-surface p-5 shadow-card">
              <h2 className="text-base font-semibold">Services you offer</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {serviceNames.map((name) => (
                  <li key={name} className="chip">
                    {name}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-muted-foreground">
                Your owner assigns these. {services.length} active{" "}
                {services.length === 1 ? "service" : "services"} exist at this business.
              </p>
            </div>
          )}

          <p className="flex items-start gap-2 rounded-xl bg-muted px-4 py-3 text-xs leading-relaxed text-muted-foreground">
            <Info size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
            You can only change your own hours and time off. Permission level, commission and the services
            you offer are set by your business owner.
          </p>
        </aside>
      </div>
    </div>
  );
}
