"use client";

import { Field, FieldDescription, FieldLabel, Select } from "@ajnacloud/ui";
import { useState } from "react";

const fruits = [
  { label: "Apple", value: "apple", category: "Everyday" },
  { label: "Banana", value: "banana", category: "Everyday" },
  { label: "Blueberry", value: "blueberry", category: "Berries" },
  { label: "Strawberry", value: "strawberry", category: "Berries" },
  { label: "Grapes", value: "grapes", category: "Seasonal", disabled: true },
];

export function SelectMultiple() {
  const [values, setValues] = useState(["apple", "banana"]);
  return (
    <div className="grid max-w-md gap-5">
      <Field>
        <FieldLabel htmlFor="select-multiple">Delivery fruits</FieldLabel>
        <Select
          id="select-multiple"
          options={fruits}
          multiple
          value={values}
          onValueChange={setValues}
          placeholder="Choose fruits"
        />
        <FieldDescription>
          Select an option again to remove it. Press Escape when finished.
        </FieldDescription>
      </Field>
      <Field>
        <FieldLabel htmlFor="select-count">
          Delivery fruits with a count
        </FieldLabel>
        <Select
          id="select-count"
          options={fruits}
          multiple
          value={values}
          onValueChange={setValues}
          placeholder="Choose fruits"
          valueProps={{
            children: (selected: string[]) =>
              selected.length
                ? `${selected.length} fruits selected`
                : "Choose fruits",
          }}
        />
      </Field>
    </div>
  );
}
