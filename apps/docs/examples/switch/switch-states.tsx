"use client";

import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
  Switch,
} from "@ajnacloud/ui";

export function SwitchStates() {
  return (
    <div style={{ maxWidth: 400, width: "100%" }}>
      <FieldGroup>
        <Field orientation="horizontal">
          <Switch id="switch-enabled" defaultChecked />
          <FieldLabel htmlFor="switch-enabled">Enabled by default</FieldLabel>
        </Field>
        <Field orientation="horizontal" data-disabled>
          <Switch id="switch-disabled" disabled />
          <FieldLabel htmlFor="switch-disabled">Not available</FieldLabel>
        </Field>
        <Field orientation="horizontal">
          <Switch id="switch-readonly" readOnly defaultChecked />
          <FieldLabel htmlFor="switch-readonly">
            Managed by your organization
          </FieldLabel>
        </Field>
        <Field orientation="horizontal" data-invalid>
          <Switch
            id="switch-invalid"
            aria-invalid="true"
            aria-describedby="switch-error"
          />
          <FieldContent>
            <FieldLabel htmlFor="switch-invalid">Enable encryption</FieldLabel>
            <FieldError id="switch-error">
              Encryption is required for this workspace.
            </FieldError>
          </FieldContent>
        </Field>
      </FieldGroup>
    </div>
  );
}
