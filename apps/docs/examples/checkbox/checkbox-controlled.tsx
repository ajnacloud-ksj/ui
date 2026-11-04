"use client";

import {
  Checkbox,
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "@ajnacloud/ui";
import { useState } from "react";

export function CheckboxControlled() {
  const [checked, setChecked] = useState(false);
  return (
    <div style={{ maxWidth: 400, width: "100%" }}>
      <Field orientation="horizontal">
        <Checkbox
          id="checkbox-controlled"
          checked={checked}
          onCheckedChange={setChecked}
          aria-describedby="checkbox-status"
        />
        <FieldContent>
          <FieldLabel htmlFor="checkbox-controlled">Send me updates</FieldLabel>
          <FieldDescription id="checkbox-status">
            {checked ? "Updates enabled." : "Updates disabled."}
          </FieldDescription>
        </FieldContent>
      </Field>
    </div>
  );
}
