"use client";

import {
  Checkbox,
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "@ajnacloud/ui";

export function CheckboxExample() {
  return (
    <div style={{ maxWidth: 400, width: "100%" }}>
      <Field orientation="horizontal">
        <Checkbox
          id="checkbox-terms"
          name="terms"
          aria-describedby="checkbox-terms-help"
        />
        <FieldContent>
          <FieldLabel htmlFor="checkbox-terms">
            Accept terms and conditions
          </FieldLabel>
          <FieldDescription id="checkbox-terms-help">
            Read the agreement before continuing.
          </FieldDescription>
        </FieldContent>
      </Field>
    </div>
  );
}
