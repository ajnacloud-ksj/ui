import { parseDate, parseDateTime } from "@internationalized/date";
import { describe, expect, it } from "vitest";

import {
  activeLabel,
  defaultMessages,
  getError,
  mergeEdits,
  type RuntimeFilter,
  valuesEqual,
} from "./filter-bar-state";

const range: RuntimeFilter = {
  id: "price",
  label: "Price",
  type: "number-range",
};
describe("filter value rules", () => {
  it("compares multi-select membership, nullable boundaries, and date values semantically", () => {
    expect(
      valuesEqual({ ...range, type: "multi-select" }, [0, "a"], ["a", 0]),
    ).toBe(true);
    expect(
      valuesEqual(range, { min: 0, max: null }, { min: 0, max: null }),
    ).toBe(true);
    expect(
      valuesEqual(range, { min: 0, max: null }, { min: null, max: null }),
    ).toBe(false);
    expect(
      valuesEqual(
        { ...range, type: "date" },
        parseDate("2026-10-01"),
        parseDate("2026-10-01"),
      ),
    ).toBe(true);
    expect(
      valuesEqual(
        { ...range, type: "date" },
        parseDate("2026-10-01"),
        parseDateTime("2026-10-01T00:00"),
      ),
    ).toBe(false);
    expect(
      valuesEqual(
        { ...range, type: "date-range" },
        { start: parseDate("2026-10-01"), end: null },
        { start: parseDate("2026-10-01"), end: null },
      ),
    ).toBe(true);
  });
  it("validates inverted ranges, finite numbers, bounds, unavailable dates, and custom values", () => {
    expect(
      getError(range, { min: 0, max: null }, defaultMessages),
    ).toBeUndefined();
    expect(getError(range, { min: 3, max: 2 }, defaultMessages)).toBe(
      defaultMessages.invalidRange,
    );
    expect(getError(range, { min: NaN, max: null }, defaultMessages)).toBe(
      defaultMessages.invalidValue,
    );
    expect(
      getError(
        { ...range, numberProps: { min: 0 } },
        { min: -1, max: null },
        defaultMessages,
      ),
    ).toBe(defaultMessages.invalidValue);
    expect(
      getError(
        { ...range, type: "date-range" },
        { start: parseDate("2026-10-02"), end: parseDate("2026-10-01") },
        defaultMessages,
      ),
    ).toBe(defaultMessages.invalidRange);
    expect(
      getError(
        {
          ...range,
          type: "date",
          dateProps: { isDateUnavailable: (date) => date.day === 1 },
        },
        parseDate("2026-10-01"),
        defaultMessages,
      ),
    ).toBe(defaultMessages.invalidValue);
    expect(
      getError(
        { ...range, type: "custom", validate: () => "Invalid custom value" },
        {},
        defaultMessages,
      ),
    ).toBe("Invalid custom value");
  });
  it("keeps removed and newly disabled edits out of a merged application update", () => {
    const value = { status: "new", page: 2, hidden: "keep", locked: 1 };
    expect(
      mergeEdits(
        value,
        { status: "active", removed: true, locked: 2 },
        [
          { ...range, id: "status", type: "select" },
          { ...range, id: "locked", disabled: true },
        ],
        false,
      ),
    ).toEqual({ status: "active", page: 2, hidden: "keep", locked: 1 });
    expect(
      mergeEdits(
        value,
        { status: "active" },
        [{ ...range, id: "status" }],
        true,
      ),
    ).toEqual(value);
  });
  it("formats zero, missing option IDs, counts, custom summaries, and date ranges", () => {
    expect(
      activeLabel(range, { min: 0, max: null }, defaultMessages, "en-US"),
    ).toBe("Price: ≥ 0");
    expect(
      activeLabel(
        {
          ...range,
          type: "select",
          getMissingLabel: (value) => `Deleted ${value}`,
        },
        0,
        defaultMessages,
        "en-US",
      ),
    ).toBe("Price: Deleted 0");
    expect(
      activeLabel(
        {
          ...range,
          type: "multi-select",
          options: [
            { value: 0, label: "Alex" },
            { value: 1, label: "Sam" },
          ],
        },
        [0, 1],
        defaultMessages,
        "en-US",
      ),
    ).toBe("Price: Alex +1");
    expect(
      activeLabel(
        { ...range, type: "date-range" },
        { start: parseDate("2026-10-01"), end: null },
        defaultMessages,
        "en-US",
        (date) => date.toString(),
      ),
    ).toBe("Price: ≥ 2026-10-01");
    expect(
      activeLabel(
        { ...range, getActiveLabel: () => "Custom summary" },
        null,
        defaultMessages,
        "en-US",
      ),
    ).toBe("Custom summary");
  });
});
