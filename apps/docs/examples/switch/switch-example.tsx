"use client";

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  Switch,
} from "@ajnacloud/ui";

export function SwitchExample() {
  return (
    <div style={{ maxWidth: 400, width: "100%" }}>
      <Field orientation="horizontal">
        <Switch
          id="switch-airplane"
          name="airplane"
          aria-describedby="switch-airplane-help"
        />
        <FieldContent>
          <FieldLabel htmlFor="switch-airplane">Airplane mode</FieldLabel>
          <FieldDescription id="switch-airplane-help">
            Turn off wireless connections.
          </FieldDescription>
        </FieldContent>
      </Field>
    </div>
  );
}
