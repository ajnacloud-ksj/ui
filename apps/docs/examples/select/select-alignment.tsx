"use client";

import { Field, FieldLabel, Select } from "@ajnacloud/ui";
import { useState } from "react";

const fruits = [
  { label: "Apple", value: "apple", category: "Everyday" },
  { label: "Banana", value: "banana", category: "Everyday" },
  { label: "Blueberry", value: "blueberry", category: "Berries" },
  { label: "Strawberry", value: "strawberry", category: "Berries" },
  { label: "Grapes", value: "grapes", category: "Seasonal", disabled: true },
];

export function SelectAlignment() {
  const [aligned, setAligned] = useState(true);
  return (
    <div className="max-w-sm space-y-4">
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={aligned}
          onChange={(event) => setAligned(event.target.checked)}
        />
        Align the selected item with the trigger
      </label>
      <Field>
        <FieldLabel htmlFor="select-alignment">Fruit</FieldLabel>
        <Select
          id="select-alignment"
          options={fruits}
          defaultValue="blueberry"
          contentProps={{ alignItemWithTrigger: aligned }}
        />
      </Field>
    </div>
  );
}
