"use client";

import { DateInput, Field, FieldError, FieldTitle } from "@ajnacloud/ui";

export function DateInputStates() {
  return (
    <div style={{ display: "grid", gap: 16, maxWidth: 320 }}>
      <DateInput
        aria-label="Disabled date"
        defaultValue="2026-04-12"
        isDisabled
        clearable
      />
      <DateInput
        aria-label="Read-only date"
        defaultValue="2026-04-12"
        isReadOnly
        clearable
      />
      <Field data-invalid>
        <FieldTitle id="invalid-date-label">Appointment</FieldTitle>
        <DateInput
          aria-labelledby="invalid-date-label"
          aria-describedby="invalid-date-error"
          isInvalid
          defaultValue="2026-04-12"
        />
        <FieldError id="invalid-date-error">
          Choose an available appointment date.
        </FieldError>
      </Field>
    </div>
  );
}
