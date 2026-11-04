"use client";

import { Field, FieldGroup, FieldLabel, Switch } from "@ajnacloud/ui";

export function SwitchSizes() {
  return (
    <div style={{ maxWidth: 400, width: "100%" }}>
      <FieldGroup>
        <Field orientation="horizontal">
          <Switch id="switch-default-size" defaultChecked />
          <FieldLabel htmlFor="switch-default-size">Default</FieldLabel>
        </Field>
        <Field orientation="horizontal">
          <Switch id="switch-small-size" size="sm" defaultChecked />
          <FieldLabel htmlFor="switch-small-size">Small</FieldLabel>
        </Field>
      </FieldGroup>
    </div>
  );
}
