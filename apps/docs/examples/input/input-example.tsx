"use client";

import { Field, FieldDescription, FieldLabel, Input } from "@ajnacloud/ui";

export function InputExample() {
  return (
    <div style={{ maxWidth: 400, width: "100%" }}>
      <Field>
        <FieldLabel htmlFor="input-email">Email</FieldLabel>
        <Input
          id="input-email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          aria-describedby="input-email-help"
        />
        <FieldDescription id="input-email-help">
          We only use this to contact you about your account.
        </FieldDescription>
      </Field>
    </div>
  );
}
