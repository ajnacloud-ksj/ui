"use client";

import {
  Checkbox,
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@ajnacloud/ui";

export function CheckboxStates() {
  return (
    <div style={{ maxWidth: 400, width: "100%" }}>
      <FieldGroup>
        <Field orientation="horizontal">
          <Checkbox id="checkbox-checked" defaultChecked />
          <FieldLabel htmlFor="checkbox-checked">Checked by default</FieldLabel>
        </Field>
        <Field orientation="horizontal">
          <Checkbox id="checkbox-mixed" indeterminate />
          <FieldLabel htmlFor="checkbox-mixed">Partially selected</FieldLabel>
        </Field>
        <Field orientation="horizontal" data-disabled>
          <Checkbox id="checkbox-disabled" disabled />
          <FieldLabel htmlFor="checkbox-disabled">Not available</FieldLabel>
        </Field>
        <Field orientation="horizontal" data-invalid>
          <Checkbox
            id="checkbox-invalid"
            aria-invalid="true"
            aria-describedby="checkbox-error"
          />
          <FieldContent>
            <FieldLabel htmlFor="checkbox-invalid">
              Accept the agreement
            </FieldLabel>
            <FieldError id="checkbox-error">
              Accept the agreement to continue.
            </FieldError>
          </FieldContent>
        </Field>
      </FieldGroup>
    </div>
  );
}
