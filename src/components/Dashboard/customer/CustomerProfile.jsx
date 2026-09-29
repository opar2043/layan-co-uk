"use client";

import { useEffect, useState } from "react";
import { UserCog, MapPin, LogOut } from "lucide-react";
import useAuth from "@/components/Auth/useAuth";
import { useMyProfile, useUpdateProfile } from "@/hooks/useUsers";
import ProfileForm from "@/components/Dashboard/ProfileForm";
import EmptyState from "@/components/Public/EmptyState";
import { CATEGORIES, GENDER_PREFERENCES } from "@/lib/constants";

/** Read-only account facts the API does not let a customer change. */
function AccountFacts({ user, onSignOut }) {
  const facts = [
    { label: "Email", value: user?.email },
    { label: "Referral code", value: user?.referralCode },
    { label: "Referred by", value: user?.referredBy || "No referrer" },
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-surface p-5 shadow-card">
        <h2 className="text-base font-semibold">Account</h2>
        <dl className="mt-4 space-y-3">
          {facts.map((fact) => (
            <div key={fact.label} className="flex flex-wrap items-baseline justify-between gap-2">
              <dt className="text-sm text-muted-foreground">{fact.label}</dt>
              <dd className="text-sm font-medium">{fact.value ?? "—"}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-5 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
          Your email is tied to your Firebase sign-in. The API only uses it for booking notifications, so
          changing it here is safe.
        </p>
      </div>

      <button type="button" onClick={onSignOut} className="btn-outline w-full text-danger hover:bg-danger/10">
        <LogOut size={15} aria-hidden="true" />
        Sign out
      </button>
    </div>
  );
}

export default function CustomerProfile() {
  const { logout } = useAuth();
  const { data, isLoading, error } = useMyProfile();
  const update = useUpdateProfile();
  const [location, setLocation] = useState({ city: "", latitude: "", longitude: "" });

  const user = data?.user;

  // Seed the location inputs once the profile arrives, and after each save.
  useEffect(() => {
    if (!user) return;
    setLocation({
      city: user.location?.city ?? "",
      latitude: user.location?.latitude ?? "",
      longitude: user.location?.longitude ?? "",
    });
  }, [user]);

  if (error) {
    return <EmptyState icon={UserCog} title="Could not load your profile" description={error.message} />;
  }

  const setLocationField = (key) => (event) =>
    setLocation((prev) => ({ ...prev, [key]: event.target.value }));

  const fields = [
    {
      key: "name",
      label: "Full name",
      type: "text",
      required: true,
      placeholder: "Alex Morgan",
      hint: "Shown to the business when you book.",
    },
    {
      key: "phone",
      label: "Phone",
      type: "tel",
      placeholder: "07123456789",
      hint: "Used for appointment reminders.",
    },
    {
      key: "genderPreference",
      label: "Hairdresser preference",
      type: "select",
      options: GENDER_PREFERENCES.map((value) => ({
        value,
        label:
          value === "no_preference"
            ? "No preference"
            : value === "male"
              ? "Male"
              : "Female",
      })),
      hint: "Helps us suggest the right stylists.",
    },
    {
      key: "favouriteCategories",
      label: "Favourite categories",
      type: "tags",
      options: CATEGORIES,
      hint: "Used to tailor the businesses we suggest.",
    },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl sm:text-3xl">Your profile</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Keep your details current so bookings go smoothly.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {isLoading ? (
          <div className="skeleton h-[32rem] w-full rounded-2xl" aria-busy="true" />
        ) : (
          <ProfileForm
            fields={fields}
            initialValues={{
              name: user?.name ?? "",
              phone: user?.phone ?? "",
              genderPreference: user?.genderPreference ?? "no_preference",
              favouriteCategories: user?.favouriteCategories ?? [],
            }}
            isPending={update.isPending}
            onSubmit={(values) =>
              // `location` is a nested object the API parses separately, so it is
              // assembled here from the fields rendered as children below.
              update.mutateAsync({
                ...values,
                location: location.city.trim()
                  ? {
                      city: location.city.trim(),
                      ...(location.latitude ? { latitude: Number(location.latitude) } : {}),
                      ...(location.longitude ? { longitude: Number(location.longitude) } : {}),
                    }
                  : null,
              })
            }
          >
            <div className="sm:col-span-2">
              <h2 className="mb-1 flex items-center gap-2 text-sm font-semibold">
                <MapPin size={15} className="text-accent" aria-hidden="true" />
                Your location
              </h2>
              <p className="hint mb-3">
                Stored only to rank businesses near you. Leave the city blank and nothing is kept.
              </p>

              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label htmlFor="loc-city" className="label">
                    City
                  </label>
                  <input
                    id="loc-city"
                    type="text"
                    value={location.city}
                    onChange={setLocationField("city")}
                    placeholder="Manchester"
                    className="input"
                  />
                </div>
                <div>
                  <label htmlFor="loc-lat" className="label">
                    Latitude
                  </label>
                  <input
                    id="loc-lat"
                    type="number"
                    step="any"
                    value={location.latitude}
                    onChange={setLocationField("latitude")}
                    placeholder="53.4808"
                    className="input"
                  />
                </div>
                <div>
                  <label htmlFor="loc-lng" className="label">
                    Longitude
                  </label>
                  <input
                    id="loc-lng"
                    type="number"
                    step="any"
                    value={location.longitude}
                    onChange={setLocationField("longitude")}
                    placeholder="-2.2426"
                    className="input"
                  />
                </div>
              </div>
            </div>
          </ProfileForm>
        )}

        <aside>{user && <AccountFacts user={user} onSignOut={logout} />}</aside>
      </div>
    </div>
  );
}
