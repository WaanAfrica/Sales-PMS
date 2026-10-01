const EAST_AFRICA_TIME_ZONE = "Africa/Nairobi";

export function getEastAfricaDateKey(date: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: EAST_AFRICA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(
    parts.map(({ type, value }) => [type, value]),
  );

  return `${values.year}-${values.month}-${values.day}`;
}

export function dateKeyToUtcDate(dateKey: string): Date {
  return new Date(`${dateKey.slice(0, 10)}T00:00:00.000Z`);
}

export function utcMonthStart(year: number, month: number): Date {
  return new Date(Date.UTC(year, month - 1, 1));
}

export function formatDateInEastAfrica(
  date: string | Date,
  options: Intl.DateTimeFormatOptions = {},
): string {
  const dateValue = date instanceof Date ? date : dateKeyToUtcDate(date);

  return dateValue.toLocaleDateString("en-GB", {
    ...options,
    timeZone: EAST_AFRICA_TIME_ZONE,
  });
}
