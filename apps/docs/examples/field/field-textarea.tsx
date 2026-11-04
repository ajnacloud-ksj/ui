"use client";

import { Field, FieldDescription, FieldLabel, Textarea } from "@ajnacloud/ui";
import { useId } from "react";

export function FieldTextarea() {
  const id = useId();
  return (
    <Field style={{ maxWidth: 400 }}>
      <FieldLabel htmlFor={id}>
        Project brief <span style={{ fontWeight: 400 }}>(optional)</span>
      </FieldLabel>
      <Textarea
        id={id}
        name="brief"
        rows={4}
        placeholder="What are you working on?"
        aria-describedby={`${id}-help`}
      />
      <FieldDescription id={`${id}-help`}>
        Describe the goal and anything your team should know.
      </FieldDescription>
    </Field>
  );
}
