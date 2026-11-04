"use client";

import {
  Field,
  FieldLabel,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@ajnacloud/ui";

export function InputGroupExample() {
  return (
    <div style={{ width: "100%", maxWidth: 400 }}>
      <Field>
        <FieldLabel htmlFor="group-website">Website</FieldLabel>
        <InputGroup>
          <InputGroupInput
            id="group-website"
            placeholder="example.com"
            aria-describedby="group-website-prefix"
          />
          <InputGroupAddon>
            <InputGroupText id="group-website-prefix">https://</InputGroupText>
          </InputGroupAddon>
        </InputGroup>
      </Field>
    </div>
  );
}
