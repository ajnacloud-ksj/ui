"use client";

import { Button, createFilterOptions, FilterBar } from "@ajnacloud/ui";
import { useState } from "react";

export function FilterBarOptionsAndLoading() {
  type Values = { owner: number | null; reviewers: number[] };
  const resetValue: Values = { owner: null, reviewers: [] };
  const [value, setValue] = useState<Values>({ owner: 0, reviewers: [42] });
  const [loading, setLoading] = useState(false);
  const people = [
    { id: 0, name: "Alex Morgan", available: 12, inactive: false },
    { id: 1, name: "Sam Lee", available: 0, inactive: false },
    { id: 2, name: "Taylor Kim", available: 4, inactive: true },
  ];
  const options = createFilterOptions(people, {
    getLabel: (person) => person.name,
    getValue: (person) => person.id,
    getCount: (person) => person.available,
    isOptionDisabled: (person) => person.inactive,
  });
  return (
    <div className="w-full space-y-4">
      <FilterBar
        value={value}
        resetValue={resetValue}
        onValueChange={setValue}
        filters={[
          {
            id: "owner",
            type: "select",
            label: "Owner",
            options: loading ? [] : options,
            isLoading: loading,
            getMissingLabel: (id) => `Unavailable person (${id})`,
          },
          {
            id: "reviewers",
            type: "multi-select",
            label: "Reviewers",
            searchable: true,
            options: loading ? [] : options,
            isLoading: loading,
            getMissingLabel: (id) => `Unavailable person (${id})`,
          },
        ]}
        actions={
          <Button
            variant="outline"
            onClick={() => setLoading((previous) => !previous)}
          >
            {loading ? "Finish loading" : "Simulate loading"}
          </Button>
        }
      />
      <p className="text-sm text-[hsl(var(--ajna-muted-foreground))]">
        Person 42 is absent from the current options. The value stays selected
        until you remove it.
      </p>
    </div>
  );
}
