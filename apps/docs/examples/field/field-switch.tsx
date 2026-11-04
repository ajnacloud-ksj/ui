"use client";

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  Switch,
} from "@ajnacloud/ui";
import { useId, useState } from "react";

export function FieldSwitch() {
  const id = useId();
  const [enabled, setEnabled] = useState(false);
  return (
    <Field orientation="horizontal" style={{ maxWidth: 400 }}>
      <FieldContent>
        <FieldLabel htmlFor={id}>Automatic backups</FieldLabel>
        <FieldDescription id={`${id}-help`}>
          Keep a daily copy of your project.
        </FieldDescription>
      </FieldContent>
      <Switch
        id={id}
        checked={enabled}
        onCheckedChange={setEnabled}
        aria-describedby={`${id}-help`}
      />
    </Field>
  );
}
