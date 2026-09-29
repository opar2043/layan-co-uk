"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";

/**
 * Location block.
 *
 * The backend stores `location.latitude` / `location.longitude` (not lat/lng) and
 * there is no map SDK in the stack, so this renders a static OpenStreetMap embed
 * built from those coordinates. No API key, and it degrades to a plain address
 * line if the coordinates are missing.
 */
export default function MapView({ location, className }) {
  const [failed, setFailed] = useState(false);
  const lat = Number(location?.latitude);
  const lng = Number(location?.longitude);
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lng) && (lat !== 0 || lng !== 0);

  const d = 0.008;
  const bbox = [lng - d, lat - d, lng + d, lat + d].join("%2C");
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`;

  return (
    <div className={className}>
      <div className="flex items-start gap-2.5">
        <MapPin size={17} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
        <div>
          <p className="text-sm font-medium text-primary">
            {location?.address || location?.city || "Address not provided"}
          </p>
          {location?.city && location?.address && (
            <p className="text-sm text-muted-foreground">{location.city}</p>
          )}
          {hasCoords && (
            <p className="mt-1 text-xs text-muted-foreground">
              {lat.toFixed(4)}, {lng.toFixed(4)}
            </p>
          )}
          {location?.mobileServiceRadiusKm > 0 && (
            <p className="mt-2 inline-flex rounded-full bg-accent-light px-2.5 py-1 text-[11px] font-medium text-accent">
              Mobile service within {location.mobileServiceRadiusKm} km
            </p>
          )}
        </div>
      </div>

      {hasCoords && !failed && (
        <div className="mt-4 overflow-hidden rounded-2xl border border-border">
          <iframe
            title="Map showing the business location"
            src={src}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-56 w-full"
            onError={() => setFailed(true)}
          />
        </div>
      )}
    </div>
  );
}
