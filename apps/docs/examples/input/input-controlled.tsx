"use client";

import { Field, FieldDescription, FieldLabel, Input } from "@ajnacloud/ui";
import { useState } from "react";

export function InputControlled() {
  const [value, setValue] = useState("");
  return (
    <div style={{ maxWidth: 400, width: "100%" }}>
      <Field>
        <FieldLabel htmlFor="input-controlled">Display name</FieldLabel>
        <Input
          id="input-controlled"
          value={value}
          onValueChange={setValue}
          aria-describedby="input-count"
        />
        <FieldDescription id="input-count">
          {value.length} characters
        </FieldDescription>
      </Field>
    </div>
  );
}
