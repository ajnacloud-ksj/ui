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
import { useState } from "react";

export function RadioGroupControlled() {
  const [value, setValue] = useState("comfortable");
  return (
    <div style={{ width: "100%", maxWidth: 400 }}>
      <FieldSet>
        <FieldLegend id="radio-density-label">Density</FieldLegend>
        <RadioGroup
          value={value}
          onValueChange={setValue}
          aria-labelledby="radio-density-label"
        >
          <Field orientation="horizontal">
            <RadioGroupItem id="radio-comfortable" value="comfortable" />
            <FieldLabel htmlFor="radio-comfortable">Comfortable</FieldLabel>
          </Field>
          <Field orientation="horizontal">
            <RadioGroupItem id="radio-compact" value="compact" />
            <FieldLabel htmlFor="radio-compact">Compact</FieldLabel>
          </Field>
        </RadioGroup>
        <FieldDescription>Selected: {value}</FieldDescription>
      </FieldSet>
    </div>
  );
}
