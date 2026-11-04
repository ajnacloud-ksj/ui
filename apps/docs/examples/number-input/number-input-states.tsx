"use client";

import { Field, FieldError, FieldLabel, NumberInput } from "@ajnacloud/ui";
import { useId } from "react";

export function NumberInputStates() {
  const id = useId();
  return (
    <div style={{ display: "grid", gap: 20, width: "100%", maxWidth: 320 }}>
      <Field>
        <FieldLabel htmlFor={`${id}-disabled`}>Unavailable quantity</FieldLabel>
        <NumberInput
          id={`${id}-disabled`}
          defaultValue={3}
          disabled
          showControls
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={`${id}-readonly`}>Allocated quantity</FieldLabel>
        <NumberInput
          id={`${id}-readonly`}
          defaultValue={6}
          readOnly
          showControls
        />
      </Field>
      <Field data-invalid>
        <FieldLabel htmlFor={`${id}-invalid`}>Required quantity</FieldLabel>
        <NumberInput
          id={`${id}-invalid`}
          aria-invalid="true"
          aria-describedby={`${id}-error`}
          placeholder="Enter a quantity"
        />
        <FieldError id={`${id}-error`}>
          Enter a quantity before continuing.
        </FieldError>
      </Field>
    </div>
  );
}
