"use client";

import {
  Field,
  FieldDescription,
  FieldLabel,
  FieldLegend,
  FieldSet,
  RadioGroup,
  RadioGroupItem,
} from "@ajnacloud/ui";

export function RadioGroupExample() {
  return (
    <div style={{ width: "100%", maxWidth: 400 }}>
      <FieldSet>
        <FieldLegend id="radio-plan-label">Plan</FieldLegend>
        <FieldDescription id="radio-plan-help">
          Choose the plan for your workspace.
        </FieldDescription>
        <RadioGroup
          name="plan"
          defaultValue="free"
          aria-labelledby="radio-plan-label"
          aria-describedby="radio-plan-help"
        >
          <Field orientation="horizontal">
            <RadioGroupItem id="radio-free" value="free" />
            <FieldLabel htmlFor="radio-free">Free</FieldLabel>
          </Field>
          <Field orientation="horizontal">
            <RadioGroupItem id="radio-pro" value="pro" />
            <FieldLabel htmlFor="radio-pro">Pro</FieldLabel>
          </Field>
          <Field orientation="horizontal" data-disabled>
            <RadioGroupItem id="radio-enterprise" value="enterprise" disabled />
            <FieldLabel htmlFor="radio-enterprise">
              Enterprise — coming soon
            </FieldLabel>
          </Field>
        </RadioGroup>
      </FieldSet>
    </div>
  );
}
