import {
  type CalendarDate,
  type DateValue,
  GregorianCalendar,
  parseAbsolute,
  parseDate,
  parseDateTime,
  toCalendar,
  toCalendarDate,
} from "@internationalized/date";

export function parseISODate(value: unknown): CalendarDate | null {
  if (typeof value !== "string") return null;
  const match = /^(?!0000)(\d{4}-\d{2}-\d{2})(?:T.+)?$/.exec(value);
  if (!match) return null;
  try {
    const date = parseDate(match[1]);
    if (value !== match[1]) {
      // Validate the full timestamp while retaining its written calendar date.
      if (/(?:Z|[+-]\d{2}(?::?\d{2})?)$/.test(value))
        parseAbsolute(value, "UTC");
      else parseDateTime(value);
    }
    return date;
  } catch {
    return null;
  }
}

export function serializeDate(value: DateValue | null): string | null {
  return value === null
    ? null
    : toCalendar(toCalendarDate(value), new GregorianCalendar()).toString();
}
