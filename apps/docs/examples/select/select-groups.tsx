"use client";

import { Field, FieldLabel, Select } from "@ajnacloud/ui";

const fruits = [
  { label: "Apple", value: "apple", category: "Everyday" },
  { label: "Banana", value: "banana", category: "Everyday" },
  { label: "Blueberry", value: "blueberry", category: "Berries" },
  { label: "Strawberry", value: "strawberry", category: "Berries" },
  { label: "Grapes", value: "grapes", category: "Seasonal", disabled: true },
];

export function SelectGroups() {
  return (
    <Field className="max-w-sm">
      <FieldLabel htmlFor="select-groups">Fruit</FieldLabel>
      <Select
        id="select-groups"
        options={fruits}
        groupBy={(fruit) => fruit.category}
        placeholder="Choose a fruit"
      />
    </Field>
  );
}
