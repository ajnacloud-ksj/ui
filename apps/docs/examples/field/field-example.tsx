"use client";

import { Field, FieldDescription, FieldLabel, Input } from "@ajnacloud/ui";
import { useId } from "react";

export function FieldExample() {
  const id = useId();
  return (
    <Field style={{ maxWidth: 400 }}>
      <FieldLabel htmlFor={id}>Email address</FieldLabel>
      <Input
        id={id}
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        aria-describedby={`${id}-help`}
      />
      <FieldDescription id={`${id}-help`}>
        We will send your invitation to this address.
      </FieldDescription>
    </Field>
  );
}
