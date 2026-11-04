"use client";

import {
  Field,
  FieldDescription,
  FieldLabel,
  FieldLegend,
  FieldSet,
  RadioGroup,
  RadioGroupItem,
} from "@ajnacloud/ui";
import { useId } from "react";

export function FieldRadio() {
  const id = useId();
  return (
    <FieldSet style={{ maxWidth: 400 }}>
      <FieldLegend id={`${id}-legend`} variant="label">
        Delivery speed
      </FieldLegend>
      <FieldDescription id={`${id}-help`}>
        Choose one delivery option.
      </FieldDescription>
      <RadioGroup
        name="delivery"
        defaultValue="standard"
        aria-labelledby={`${id}-legend`}
        aria-describedby={`${id}-help`}
      >
        <Field orientation="horizontal">
          <RadioGroupItem id={`${id}-standard`} value="standard" />
          <FieldLabel htmlFor={`${id}-standard`}>
            Standard · 3–5 business days
          </FieldLabel>
        </Field>
        <Field orientation="horizontal">
          <RadioGroupItem id={`${id}-express`} value="express" />
          <FieldLabel htmlFor={`${id}-express`}>
            Express · 1–2 business days
          </FieldLabel>
        </Field>
      </RadioGroup>
    </FieldSet>
  );
}
