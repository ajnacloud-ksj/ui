"use client";

import {
  Field,
  FieldDescription,
  FieldLabel,
  NumberInput,
} from "@ajnacloud/ui";
import { useId } from "react";

export function NumberInputExample() {
  const id = useId();
  return (
    <Field style={{ maxWidth: 320 }}>
      <FieldLabel htmlFor={id}>Quantity</FieldLabel>
      <NumberInput
        id={id}
        defaultValue={3}
        min={0}
        aria-describedby={`${id}-help`}
      />
      <FieldDescription id={`${id}-help`}>
        How many items should we order?
      </FieldDescription>
    </Field>
  );
}
