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

export function SelectBasic() {
  const [value, setValue] = useState<string | null>(null);
  return (
    <Field className="max-w-sm">
      <FieldLabel htmlFor="select-fruit">Fruit</FieldLabel>
      <Select
        id="select-fruit"
        options={fruits}
        value={value}
        onValueChange={setValue}
        placeholder="Choose a fruit"
        aria-describedby="select-fruit-help"
      />
      <FieldDescription id="select-fruit-help">
        Choose one fruit for your delivery.
      </FieldDescription>
      <output className="text-xs opacity-70">
        Selected value: {value ?? "none"}
      </output>
    </Field>
  );
}
