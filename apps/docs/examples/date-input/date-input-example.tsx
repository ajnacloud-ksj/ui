"use client";

import { DateInput, Field, FieldTitle } from "@ajnacloud/ui";
import { useId } from "react";

export function DateInputExample() {
  const id = useId();
  return (
    <Field style={{ maxWidth: 320 }}>
      <FieldTitle id={id}>Appointment date</FieldTitle>
      <DateInput
        aria-labelledby={id}
        locale="en-GB"
        defaultValue="2026-04-12"
      />
    </Field>
  );
}
