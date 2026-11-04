"use client";

import { Button, Field, FieldLabel, Select } from "@ajnacloud/ui";
import { useRef } from "react";

const fruits = [
  { label: "Apple", value: "apple", category: "Everyday" },
  { label: "Banana", value: "banana", category: "Everyday" },
  { label: "Blueberry", value: "blueberry", category: "Berries" },
  { label: "Strawberry", value: "strawberry", category: "Berries" },
  { label: "Grapes", value: "grapes", category: "Seasonal", disabled: true },
];

export function SelectFocus() {
  const ref = useRef<HTMLButtonElement>(null);
  return (
    <div className="max-w-sm space-y-4">
      <Field>
        <FieldLabel htmlFor="select-focus">Fruit</FieldLabel>
        <Select
          id="select-focus"
          ref={ref}
          options={fruits}
          placeholder="Choose a fruit"
        />
      </Field>
      <Button
        variant="outline"
        onClick={() => ref.current?.focus({ preventScroll: true })}
      >
        Focus select
      </Button>
    </div>
  );
}
