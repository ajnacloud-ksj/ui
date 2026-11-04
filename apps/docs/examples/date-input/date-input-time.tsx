"use client";

import { DateInput, Field, FieldDescription, FieldTitle } from "@ajnacloud/ui";
import { parseDateTime } from "@internationalized/date";
import { useId } from "react";

export function DateInputTime() {
  const id = useId();
  return (
    <Field style={{ maxWidth: 360 }}>
      <FieldTitle id={id}>Local appointment time</FieldTitle>
      <DateInput
        aria-labelledby={id}
        locale="en-GB"
        defaultValue={parseDateTime("2026-04-12T09:30")}
        granularity="minute"
        hourCycle={24}
      />
      <FieldDescription>
        The calendar chooses the day. Edit hours and minutes in the field.
      </FieldDescription>
    </Field>
  );
}
