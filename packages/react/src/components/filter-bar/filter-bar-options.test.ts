import { expect, it } from "vitest";

import { createFilterOptions } from "./filter-bar-options";

it("maps application records without losing zero IDs, disabled state, counts, or custom content", () => {
  const records = [{ id: 0, name: "Alex", remaining: 0, archived: true }];
  expect(
    createFilterOptions(records, {
      getLabel: (record) => record.name,
      getValue: (record) => record.id,
      isOptionDisabled: (record) => record.archived,
      getCount: (record) => record.remaining,
      renderOption: (record) => `Person ${record.name}`,
    }),
  ).toEqual([
    {
      value: 0,
      label: "Alex",
      disabled: true,
      count: 0,
      content: "Person Alex",
    },
  ]);
  expect(records[0]).toEqual({
    id: 0,
    name: "Alex",
    remaining: 0,
    archived: true,
  });
});
