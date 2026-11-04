"use client";

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  Switch,
} from "@ajnacloud/ui";
import { useState } from "react";

export function SwitchControlled() {
  const [checked, setChecked] = useState(false);
  return (
    <div style={{ maxWidth: 400, width: "100%" }}>
      <Field orientation="horizontal">
        <Switch
          id="switch-controlled"
          checked={checked}
          onCheckedChange={setChecked}
          aria-describedby="switch-status"
        />
        <FieldContent>
          <FieldLabel htmlFor="switch-controlled">
            Email notifications
          </FieldLabel>
          <FieldDescription id="switch-status">
            {checked ? "Notifications enabled." : "Notifications disabled."}
          </FieldDescription>
        </FieldContent>
      </Field>
    </div>
  );
}
