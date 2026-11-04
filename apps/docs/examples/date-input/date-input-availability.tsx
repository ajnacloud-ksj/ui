"use client";

import { DateInput, Field, FieldDescription, FieldTitle } from "@ajnacloud/ui";
import { isWeekend, parseDate } from "@internationalized/date";
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
        placeholderValue={parseDate("2026-04-01")}
        minValue={parseDate("2026-04-01")}
        maxValue={parseDate("2027-06-30")}
        isDateUnavailable={(date) => isWeekend(date, "en-GB")}
      />
      <FieldDescription id={`${id}-help`}>
        Choose a weekday between April 2026 and June 2027.
      </FieldDescription>
    </Field>
  );
}
