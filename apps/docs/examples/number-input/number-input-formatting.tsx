"use client";

import { Field, FieldLabel, NumberInput } from "@ajnacloud/ui";
import { useId } from "react";

export function NumberInputFormatting() {
  const id = useId();
  return (
    <div style={{ display: "grid", gap: 20, width: "100%", maxWidth: 320 }}>
      <Field>
        <FieldLabel htmlFor={`${id}-usd`}>Price in US dollars</FieldLabel>
        <NumberInput
          id={`${id}-usd`}
          defaultValue={1234.5}
          locale="en-US"
          format={{ style: "currency", currency: "USD" }}
          min={0}
          step={0.01}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={`${id}-eur`}>Price in euros</FieldLabel>
        <NumberInput
          id={`${id}-eur`}
          defaultValue={1234.5}
          locale="de-DE"
          format={{ style: "currency", currency: "EUR" }}
          min={0}
          step={0.01}
        />
      </Field>
    </div>
  );
}
