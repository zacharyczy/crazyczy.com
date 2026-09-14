export type VisitorLocation = {
  latitude: number;
  longitude: number;
  city: string | null;
  country: string | null;
};
export function visitorLocation(
  cf: Record<string, unknown> | undefined,
): VisitorLocation | null {
  const number = (value: unknown) =>
    typeof value === 'number' ||
    (typeof value === 'string' && value.trim() !== '')
      ? Number(value)
      : NaN;
  const latitude = number(cf?.latitude),
    longitude = number(cf?.longitude);
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    Math.abs(latitude) > 90 ||
    Math.abs(longitude) > 180
  )
    return null;
  const label = (value: unknown) =>
    typeof value === 'string' && value.trim()
      ? value.trim().slice(0, 80)
      : null;
  // Rounded network location only. Never return or persist the visitor's IP.
  return {
    latitude: Math.round(latitude * 10) / 10,
    longitude: Math.round(longitude * 10) / 10,
    city: label(cf?.city),
    country: label(cf?.country),
  };
}
export function mapPoint(location: VisitorLocation): [number, number, number] {
  return [
    (location.longitude / 360) * 3.72,
    (Math.max(-85, Math.min(85, location.latitude)) / 170) * 2.15,
    0.15,
  ];
}
