"use client";

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  Input,
} from "@ajnacloud/ui";

export function InputStates() {
  return (
    <div style={{ maxWidth: 400, width: "100%" }}>
      <FieldGroup>
        <Field data-disabled>
          <FieldLabel htmlFor="input-disabled">Disabled</FieldLabel>
          <Input id="input-disabled" disabled placeholder="Not available" />
        </Field>
        <Field>
          <FieldLabel htmlFor="input-readonly">Read only</FieldLabel>
          <Input id="input-readonly" readOnly defaultValue="AJNA-001" />
        </Field>
        <Field data-invalid>
          <FieldLabel htmlFor="input-invalid">Email</FieldLabel>
          <Input
            id="input-invalid"
            type="email"
            defaultValue="invalid-email"
            aria-invalid="true"
            aria-describedby="input-error"
          />
          <FieldError id="input-error">Enter a valid email address.</FieldError>
        </Field>
      </FieldGroup>
    </div>
  );
}
