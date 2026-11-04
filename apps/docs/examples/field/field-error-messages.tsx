"use client";

import { Field, FieldError, FieldLabel, Input } from "@ajnacloud/ui";
import { useId, useState } from "react";

export function FieldErrorMessages() {
  const id = useId();
  const [password, setPassword] = useState("");
  const errors = [
    password.length < 8
      ? { message: "Use at least eight characters." }
      : undefined,
    !/\d/.test(password)
      ? { message: "Include at least one number." }
      : undefined,
  ];
  const invalid = errors.some(Boolean);
  return (
    <Field style={{ maxWidth: 400 }} data-invalid={invalid}>
      <FieldLabel htmlFor={id}>New password</FieldLabel>
      <Input
        id={id}
        type="password"
        autoComplete="new-password"
        value={password}
        onValueChange={setPassword}
        aria-invalid={invalid}
        aria-describedby={invalid ? `${id}-errors` : undefined}
      />
      <FieldError id={`${id}-errors`} errors={errors} />
    </Field>
  );
}
