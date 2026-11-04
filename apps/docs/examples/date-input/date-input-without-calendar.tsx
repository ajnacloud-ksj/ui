"use client";

import { DateInput, Field, FieldTitle } from "@ajnacloud/ui";
import { useId } from "react";

export function DateInputWithoutCalendar() {
  const id = useId();
  return (
    <Field style={{ maxWidth: 320 }}>
      <FieldTitle id={id}>Date of birth</FieldTitle>
      <DateInput aria-labelledby={id} locale="en-GB" hideCalendar clearable />
    </Field>
  );
}
