"use client";

import {
  Checkbox,
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@ajnacloud/ui";

export function CheckboxCard() {
  return (
    <div style={{ maxWidth: 400, width: "100%" }}>
      <FieldLabel>
        <Field orientation="horizontal">
          <Checkbox name="backup" />
          <FieldContent>
            <FieldTitle>Keep a backup</FieldTitle>
            <FieldDescription>Save a copy of your project.</FieldDescription>
          </FieldContent>
        </Field>
      </FieldLabel>
    </div>
  );
}
