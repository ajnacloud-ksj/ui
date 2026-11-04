"use client";

import {
  Checkbox,
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  Input,
} from "@ajnacloud/ui";
import { useId } from "react";

export function FieldGrouping() {
  const id = useId();
  return (
    <FieldGroup style={{ maxWidth: 400 }}>
      <FieldSet aria-describedby={`${id}-address-help`}>
        <FieldLegend>Shipping address</FieldLegend>
        <FieldDescription id={`${id}-address-help`}>
          Where should we send your order?
        </FieldDescription>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor={`${id}-street`}>Street address</FieldLabel>
            <Input
              id={`${id}-street`}
              name="street"
              autoComplete="shipping street-address"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor={`${id}-city`}>City</FieldLabel>
            <Input
              id={`${id}-city`}
              name="city"
              autoComplete="shipping address-level2"
            />
          </Field>
        </FieldGroup>
      </FieldSet>
      <FieldSeparator>Delivery preferences</FieldSeparator>
      <FieldSet>
        <FieldLegend variant="label">Contact</FieldLegend>
        <FieldGroup>
          <Field orientation="horizontal">
            <Checkbox id={`${id}-sms`} name="sms" />
            <FieldLabel htmlFor={`${id}-sms`}>
              Text me when my order arrives
            </FieldLabel>
          </Field>
        </FieldGroup>
      </FieldSet>
    </FieldGroup>
  );
}
