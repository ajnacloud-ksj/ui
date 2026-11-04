"use client";

import { Field, FieldLabel, Input } from "@ajnacloud/ui";
import { useId } from "react";

export function FieldRequired() {
  const id = useId();
  return (
    <Field style={{ maxWidth: 400 }}>
      <FieldLabel htmlFor={id} required>
        Work email
      </FieldLabel>
      <Input
        id={id}
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@company.com"
        required
      />
    </Field>
  );
}
