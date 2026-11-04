"use client";

import { Field, FieldGroup, FieldLabel, Input } from "@ajnacloud/ui";

export function InputTypes() {
  return (
    <div style={{ maxWidth: 400, width: "100%" }}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="input-password">Password</FieldLabel>
          <Input
            id="input-password"
            type="password"
            autoComplete="new-password"
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="input-file">Attachment</FieldLabel>
          <Input id="input-file" type="file" />
        </Field>
      </FieldGroup>
    </div>
  );
}
