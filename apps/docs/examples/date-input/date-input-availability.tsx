"use client";

import { DateInput, Field, FieldDescription, FieldTitle } from "@ajnacloud/ui";
import { useId } from "react";

export function DateInputAvailability() {
  const id = useId();
  return (
    <Field style={{ maxWidth: 320 }}>
      <FieldTitle id={id}>Delivery date</FieldTitle>
      <DateInput
        aria-labelledby={id}
        aria-describedby={`${id}-help`}
        locale="en-GB"
        placeholderValue="2026-04-01"
        minValue="2026-04-01"
        maxValue="2027-06-30"
        isDateUnavailable={(date) =>
          [0, 6].includes(new Date(`${date}T12:00:00Z`).getUTCDay())
        }
      />
      <FieldDescription id={`${id}-help`}>
        Choose a weekday between April 2026 and June 2027.
      </FieldDescription>
    </Field>
  );
}
