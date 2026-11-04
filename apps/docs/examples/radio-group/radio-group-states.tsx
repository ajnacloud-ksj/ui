"use client";

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
  RadioGroup,
  RadioGroupItem,
} from "@ajnacloud/ui";

export function RadioGroupStates() {
  return (
    <div style={{ width: "100%", maxWidth: 400 }}>
      <FieldSet>
        <FieldLegend id="radio-payment-label">Payment method</FieldLegend>
        <RadioGroup
          name="payment"
          aria-labelledby="radio-payment-label"
          aria-describedby="radio-payment-error"
          aria-invalid="true"
        >
          <Field orientation="horizontal" data-invalid>
            <RadioGroupItem
              id="radio-card"
              value="card"
              aria-invalid="true"
              aria-describedby="radio-payment-error"
            />
            <FieldContent>
              <FieldLabel htmlFor="radio-card">Credit card</FieldLabel>
              <FieldDescription>Pay using your saved card.</FieldDescription>
            </FieldContent>
          </Field>
          <Field orientation="horizontal" data-invalid>
            <RadioGroupItem
              id="radio-invoice"
              value="invoice"
              aria-invalid="true"
              aria-describedby="radio-payment-error"
            />
            <FieldLabel htmlFor="radio-invoice">Invoice</FieldLabel>
          </Field>
        </RadioGroup>
        <FieldError id="radio-payment-error">
          Choose a payment method.
        </FieldError>
      </FieldSet>
    </div>
  );
}
