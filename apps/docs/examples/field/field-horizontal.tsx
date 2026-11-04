"use client";

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  Input,
} from "@ajnacloud/ui";
import { useId } from "react";

export function FieldHorizontal() {
  const id = useId();
  return (
    <Field orientation="horizontal" style={{ maxWidth: 400 }}>
      <FieldContent>
        <FieldLabel htmlFor={id}>Display name</FieldLabel>
        <FieldDescription id={`${id}-help`}>
          Shown on your profile.
        </FieldDescription>
      </FieldContent>
      <Input
        id={id}
        defaultValue="Alex Morgan"
        style={{ width: "55%" }}
        aria-describedby={`${id}-help`}
      />
    </Field>
  );
}
