"use client";

import { Field, FieldDescription, FieldLabel, Textarea } from "@ajnacloud/ui";
import { useState } from "react";

export function TextareaControlled() {
  const [value, setValue] = useState("");
  return (
    <div style={{ maxWidth: 400, width: "100%" }}>
      <Field>
        <FieldLabel htmlFor="textarea-controlled">Biography</FieldLabel>
        <Textarea
          id="textarea-controlled"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          maxLength={200}
          aria-describedby="textarea-count"
        />
        <FieldDescription id="textarea-count">
          {value.length}/200 characters
        </FieldDescription>
      </Field>
    </div>
  );
}
