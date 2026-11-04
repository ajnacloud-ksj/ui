"use client";

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  Textarea,
} from "@ajnacloud/ui";

export function TextareaStates() {
  return (
    <div style={{ maxWidth: 400, width: "100%" }}>
      <FieldGroup>
        <Field data-disabled>
          <FieldLabel htmlFor="textarea-disabled">Disabled</FieldLabel>
          <Textarea
            id="textarea-disabled"
            disabled
            placeholder="Not available"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="textarea-readonly">Read only</FieldLabel>
          <Textarea
            id="textarea-readonly"
            readOnly
            defaultValue="This message is archived."
          />
        </Field>
        <Field data-invalid>
          <FieldLabel htmlFor="textarea-invalid">Message</FieldLabel>
          <Textarea
            id="textarea-invalid"
            defaultValue="Hi"
            aria-invalid="true"
            aria-describedby="textarea-error"
          />
          <FieldError id="textarea-error">Add a little more detail.</FieldError>
        </Field>
      </FieldGroup>
    </div>
  );
}
