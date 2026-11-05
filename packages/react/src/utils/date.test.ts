import { HebrewCalendar, toCalendar } from "@internationalized/date";
import { expect, it } from "vitest";

import { parseISODate, serializeDate } from "./date";

it("accepts canonical valid ISO dates without rolling invalid dates", () => {
  expect(parseISODate("2024-02-29")?.toString()).toBe("2024-02-29");
  for (const value of [
    null,
    undefined,
    "",
    "2026-02-29",
    "2026-04-31",
    "2026-4-12",
    "0000-01-01",
    new Date(),
  ]) {
    expect(parseISODate(value)).toBeNull();
  }
});

it("serializes localized calendar values back to the same Gregorian date and preserves null", () => {
  const date = parseISODate("2026-04-12")!;
  expect(serializeDate(toCalendar(date, new HebrewCalendar()))).toBe(
    "2026-04-12",
  );
  expect(serializeDate(null)).toBeNull();
});

it("accepts complete ISO timestamps and preserves their written calendar date", () => {
  for (const value of [
    "2026-04-12T23:30:00Z",
    "2026-04-12T00:30:00+14:00",
    "2026-04-12T23:30:00-12:00",
    "2026-04-12T09:30",
    "2026-04-12T09:30:45.123+05:30",
  ]) {
    expect(serializeDate(parseISODate(value))).toBe("2026-04-12");
  }
  for (const value of [
    "2026-02-30T09:30:00Z",
    "2026-04-12T24:00:00Z",
    "2026-04-12T09:60:00Z",
    "2026-04-12T09:30:60Z",
    "2026-04-12T09:30:00+24:00",
    "2026-04-12T09:30:00+05:60",
    "2026-04-12Tgarbage",
    "2026-04-12T09:30:00Ztrailing",
    "04/05/2026",
  ]) {
    expect(parseISODate(value)).toBeNull();
  }
});
