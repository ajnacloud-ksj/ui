"use client";

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@ajnacloud/ui";

export function InputGroupStates() {
  return (
    <div style={{ width: "100%", maxWidth: 400 }}>
      <FieldGroup>
        <Field data-invalid>
          <FieldLabel htmlFor="group-price">Price</FieldLabel>
          <InputGroup>
            <InputGroupInput
              id="group-price"
              defaultValue="invalid"
              aria-invalid="true"
              aria-describedby="group-price-error"
            />
            <InputGroupAddon>
              <InputGroupText>$</InputGroupText>
            </InputGroupAddon>
          </InputGroup>
          <FieldError id="group-price-error">Enter a valid price.</FieldError>
        </Field>
        <Field data-disabled>
          <FieldLabel htmlFor="group-disabled">Website</FieldLabel>
          <InputGroup>
            <InputGroupInput
              id="group-disabled"
              disabled
              placeholder="Not available"
            />
            <InputGroupAddon>
              <InputGroupText>https://</InputGroupText>
            </InputGroupAddon>
          </InputGroup>
        </Field>
      </FieldGroup>
    </div>
  );
}
