"use client";

import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  Input,
  Switch,
} from "@ajnacloud/ui";
import { useId } from "react";

export function FieldDisabled() {
  const id = useId();
  return (
    <FieldSet disabled style={{ maxWidth: 400 }}>
      <FieldLegend>Managed by your organization</FieldLegend>
      <FieldGroup>
        <Field data-disabled>
          <FieldLabel htmlFor={`${id}-email`}>Work email</FieldLabel>
          <Input
            id={`${id}-email`}
            type="email"
            defaultValue="alex@example.com"
          />
        </Field>
        <Field orientation="horizontal" data-disabled>
          <Switch id={`${id}-backups`} disabled defaultChecked />
          <FieldLabel htmlFor={`${id}-backups`}>Automatic backups</FieldLabel>
        </Field>
      </FieldGroup>
    </FieldSet>
  );
}
