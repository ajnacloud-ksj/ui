"use client";

import { Field, FieldDescription, FieldLabel, Textarea } from "@ajnacloud/ui";

export function TextareaExample() {
  return (
    <div style={{ maxWidth: 400, width: "100%" }}>
      <Field>
        <FieldLabel htmlFor="textarea-feedback">Feedback</FieldLabel>
        <Textarea
          id="textarea-feedback"
          placeholder="Share your thoughts"
          rows={4}
          aria-describedby="textarea-feedback-help"
        />
        <FieldDescription id="textarea-feedback-help">
          Tell us what worked and what could be better.
        </FieldDescription>
      </Field>
    </div>
  );
}
