"use client";

import { DateInput, Field, FieldDescription, FieldTitle } from "@ajnacloud/ui";
import { useState } from "react";

export function DateInputControlled() {
  const [value, setValue] = useState<string | null>("2026-04-12");
  return (
    <Field style={{ maxWidth: 320 }}>
      <FieldTitle id="controlled-date-label">Departure</FieldTitle>
      <DateInput
        aria-labelledby="controlled-date-label"
        locale="en-GB"
        value={value}
        onChange={setValue}
        clearable
      />
      <FieldDescription>Selected ISO date: {value ?? "None"}</FieldDescription>
    </Field>
  );
}
