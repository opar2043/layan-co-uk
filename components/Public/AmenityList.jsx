/** Amenity chips, rendered from the business document's `amenities` string array. */
export default function AmenityList({ amenities = [], className }) {
  if (!amenities.length) return null;
  return (
    <ul className={className} aria-label="Amenities">
      {amenities.map((amenity) => (
        <li
          key={amenity}
          className="inline-flex items-center rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted-foreground"
        >
          {amenity}
        </li>
      ))}
    </ul>
  );
}
