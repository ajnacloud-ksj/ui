"use client";

import { Field, FieldError, FieldLabel, PasswordInput } from "@ajnacloud/ui";
import { useId } from "react";

export function PasswordInputStates() {
  const id = useId();
  return (
    <div style={{ display: "grid", gap: 20, width: "100%", maxWidth: 360 }}>
      <Field>
        <FieldLabel htmlFor={`${id}-disabled`}>Unavailable password</FieldLabel>
        <PasswordInput
          id={`${id}-disabled`}
          defaultValue="example-only"
          disabled
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={`${id}-readonly`}>Read-only secret</FieldLabel>
        <PasswordInput
          id={`${id}-readonly`}
          defaultValue="example-only"
          readOnly
        />
      </Field>
      <Field data-invalid>
        <FieldLabel htmlFor={`${id}-invalid`}>
          Password requiring attention
        </FieldLabel>
        <PasswordInput
          id={`${id}-invalid`}
          aria-invalid="true"
          aria-describedby={`${id}-error`}
          autoComplete="current-password"
        />
        <FieldError id={`${id}-error`}>
          Enter your password to continue.
        </FieldError>
      </Field>
    </div>
  );
}
