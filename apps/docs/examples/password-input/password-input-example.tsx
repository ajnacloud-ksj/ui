"use client";

import { Field, FieldLabel, PasswordInput } from "@ajnacloud/ui";
import { useId } from "react";

export function PasswordInputExample() {
  const id = useId();
  return (
    <Field style={{ maxWidth: 360 }}>
      <FieldLabel htmlFor={id}>Password</FieldLabel>
      <PasswordInput
        id={id}
        autoComplete="current-password"
        placeholder="Enter your password"
      />
    </Field>
  );
}
