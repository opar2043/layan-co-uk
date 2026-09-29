"use client";

import { useEffect, useState } from "react";
import { Store, MapPin, Trash2, Plus, ImageOff } from "lucide-react";
import { useMyBusiness, useUpdateBusiness } from "@/hooks/useBusinesses";
import ProfileForm from "@/components/Dashboard/ProfileForm";
import ImageUploader from "@/components/Public/ImageUploader";
import StatusBadge from "@/components/Public/StatusBadge";
import EmptyState from "@/components/Public/EmptyState";
import { CATEGORIES } from "@/lib/constants";

/** String list editor for `amenities` and `portfolio`. */
function StringListEditor({ label, hint, values, onChange, placeholder }) {
  const [draft, setDraft] = useState("");

  const add = () => {
    const value = draft.trim();
    if (!value || values.includes(value)) return;
    onChange([...values, value]);
    setDraft("");
  };

  return (
    <div className="sm:col-span-2">
      <p className="label">{label}</p>
      {hint && <p className="hint mb-2">{hint}</p>}

      {values.length > 0 && (
        <ul className="mb-2.5 flex flex-wrap gap-2">
          {values.map((value) => (
            <li
              key={value}
              className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-medium"
            >
              <span className="max-w-[16rem] truncate">{value}</span>
              <button
                type="button"
                onClick={() => onChange(values.filter((entry) => entry !== value))}
                className="rounded-full p-0.5 text-muted-foreground hover:bg-danger hover:text-white"
                aria-label={`Remove ${value}`}
              >
                <Trash2 size={11} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
          className="input py-2.5 text-sm"
        />
        <button type="button" onClick={add} className="btn-outline btn-sm shrink-0">
          <Plus size={14} aria-hidden="true" />
          Add
        </button>
      </div>
    </div>
  );
}

export default function OwnerBusinessProfile() {
  const { data, isLoading, error, refetch } = useMyBusiness();
  const update = useUpdateBusiness();

  const business = data?.business ?? data;

  // Images, amenities and portfolio are managed by their own controls, so they
  // live outside ProfileForm's flat draft and are merged in on submit.
  const [coverImage, setCoverImage] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [amenities, setAmenities] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  // `openingHours` is a free-text string on the business model ("Mon: 09:00-17:00" per
  // line), not an array — so it is edited and sent as one string.
  const [hours, setHours] = useState("");

  useEffect(() => {
    if (!business) return;
    setCoverImage(business.coverImage ?? "");
    setProfileImage(business.profileImage ?? "");
    setAmenities(business.amenities ?? []);
    setPortfolio(business.portfolio ?? []);
    setHours(business.openingHours ?? "");
  }, [business]);

  if (error) {
    return (
      <EmptyState
        icon={Store}
        title="Could not load your business"
        description={error.message}
        action={
          <button type="button" onClick={() => refetch()} className="btn-outline btn-sm">
            Try again
          </button>
        }
      />
    );
  }

  if (isLoading) {
    return <div className="skeleton h-[40rem] w-full rounded-2xl" aria-busy="true" />;
  }

  if (!business) {
    return (
      <EmptyState
        icon={Store}
        title="No business listing found"
        description="Your account is not linked to a business. Register a business to set one up."
      />
    );
  }

  const fields = [
    {
      key: "businessName",
      label: "Business name",
      type: "text",
      required: true,
      placeholder: "Aurora Hair Studio",
    },
    {
      key: "ownerName",
      label: "Your name",
      type: "text",
      required: true,
      placeholder: "Alex Morgan",
      hint: "Only admins see this. It is never shown publicly.",
    },
    {
      key: "category",
      label: "Category",
      type: "select",
      required: true,
      options: CATEGORIES.map((value) => ({ value, label: value })),
    },
    {
      key: "bookingUrl",
      label: "Booking URL",
      type: "url",
      placeholder: "https://example.com/book",
      hint: "Optional external booking page.",
    },
    {
      key: "description",
      label: "About your business",
      type: "textarea",
      rows: 5,
      maxLength: 2000,
      placeholder: "Tell customers what makes your business special…",
      hint: "Appears at the top of your public page.",
    },
    {
      key: "location.address",
      label: "Address",
      type: "text",
      placeholder: "12 Dale Street",
    },
    {
      key: "location.city",
      label: "City",
      type: "text",
      placeholder: "Manchester",
    },
    {
      key: "location.mobileServiceRadiusKm",
      label: "Mobile service radius (km)",
      type: "number",
      min: 0,
      max: 100,
      hint: "0 means you do not travel to customers.",
    },
    {
      key: "cancellationPolicy",
      label: "Cancellation policy",
      type: "textarea",
      rows: 3,
      maxLength: 1000,
      placeholder: "Free cancellation up to 24 hours before your appointment.",
    },
    {
      key: "instantBookEnabled",
      label: "Allow instant booking",
      type: "checkbox",
      hint: "Customers can book without waiting for you to confirm.",
    },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl sm:text-3xl">Business profile</h1>
        <p className="mt-1.5 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          This is what customers see on your public page.
          <StatusBadge status={business.verificationStatus} label="Verification" />
        </p>
      </header>

      <ProfileForm
        fields={fields}
        initialValues={{
          businessName: business.businessName ?? "",
          ownerName: business.ownerName ?? "",
          category: business.category ?? "",
          bookingUrl: business.bookingUrl ?? "",
          description: business.description ?? "",
          "location.address": business.location?.address ?? "",
          "location.city": business.location?.city ?? "",
          "location.mobileServiceRadiusKm": business.location?.mobileServiceRadiusKm ?? 0,
          cancellationPolicy: business.cancellationPolicy ?? "",
          instantBookEnabled: Boolean(business.instantBookEnabled),
        }}
        isPending={update.isPending}
        onSubmit={(values) => {
          // ProfileForm uses dotted keys for the nested `location` object.
          const payload = { ...values };
          const address = values["location.address"] ?? business.location?.address ?? "";
          const city = values["location.city"] ?? business.location?.city ?? "";

          payload.location = {
            address,
            city,
            mobileServiceRadiusKm: Number(
              values["location.mobileServiceRadiusKm"] ?? business.location?.mobileServiceRadiusKm ?? 0
            ),
            ...(business.location?.latitude ? { latitude: business.location.latitude } : {}),
            ...(business.location?.longitude ? { longitude: business.location.longitude } : {}),
          };
          delete payload["location.address"];
          delete payload["location.city"];
          delete payload["location.mobileServiceRadiusKm"];

          return update.mutateAsync({
            ...payload,
            coverImage,
            profileImage,
            amenities,
            portfolio,
            ...(hours.trim() ? { openingHours: hours } : {}),
          });
        }}
      >
        <div className="sm:col-span-2 space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <p className="label">Cover image</p>
              <p className="hint mb-2.5">The wide banner at the top of your page.</p>
              <ImageUploader
                value={coverImage}
                onChange={setCoverImage}
                label="Cover image"
                aspect="aspect-[16/9]"
              />
            </div>
            <div>
              <p className="label">Profile image</p>
              <p className="hint mb-2.5">Your logo or square avatar.</p>
              <ImageUploader
                value={profileImage}
                onChange={setProfileImage}
                label="Profile image"
                aspect="aspect-square"
              />
            </div>
          </div>

          <div>
            <p className="label">
              <MapPin size={13} className="mr-1 inline" aria-hidden="true" />
              Opening hours
            </p>
            <p className="hint mb-2.5">
              One line per day, e.g. <code className="font-mono text-[11px]">Monday: 09:00 - 17:00</code>.
              Leave blank if you are always open.
            </p>
            <textarea
              rows={4}
              value={hours}
              onChange={(event) => setHours(event.target.value)}
              placeholder={"Monday: 09:00 - 17:00\nTuesday: 09:00 - 17:00"}
              className="input resize-y font-mono text-sm"
              aria-label="Opening hours"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <StringListEditor
              label="Amenities"
              hint="Shown as badges on your page."
              values={amenities}
              onChange={setAmenities}
              placeholder="Wheelchair accessible"
            />
            <StringListEditor
              label="Portfolio"
              hint="Image URLs for your work."
              values={portfolio}
              onChange={setPortfolio}
              placeholder="https://…"
            />
          </div>
        </div>
      </ProfileForm>

      {update.isError && (
        <p className="flex items-center gap-2 text-sm text-danger">
          <ImageOff size={15} aria-hidden="true" />
          {update.error.message}
        </p>
      )}
    </div>
  );
}
