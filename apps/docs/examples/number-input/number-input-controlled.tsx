"use client";

import {
  Field,
  FieldDescription,
  FieldLabel,
  NumberInput,
} from "@ajnacloud/ui";
import { useId, useState } from "react";

export function NumberInputControlled() {
  const id = useId();
  const [value, setValue] = useState<number | null>(2.5);
  return (
    <Field style={{ maxWidth: 320 }}>
      <FieldLabel htmlFor={id}>Weight in kilograms</FieldLabel>
      <NumberInput
        id={id}
        value={value}
        onValueChange={setValue}
        min={0}
        max={10}
        step={0.5}
        suffix="kg"
        showControls
        aria-describedby={`${id}-help`}
      />
      <FieldDescription id={`${id}-help`}>
        Between 0 and 10 kg, in half-kilogram steps. Clear the input to leave it
        empty.
      </FieldDescription>
      <span>Numeric value: {value === null ? "empty" : value}</span>
    </Field>
  );
}
