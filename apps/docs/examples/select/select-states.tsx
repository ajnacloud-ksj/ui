"use client";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  Select,
} from "@ajnacloud/ui";

const fruits = [
  { label: "Apple", value: "apple", category: "Everyday" },
  { label: "Banana", value: "banana", category: "Everyday" },
  { label: "Blueberry", value: "blueberry", category: "Berries" },
  { label: "Strawberry", value: "strawberry", category: "Berries" },
  { label: "Grapes", value: "grapes", category: "Seasonal", disabled: true },
];

export function SelectStates() {
  return (
    <div className="grid max-w-sm gap-5">
      <Field>
        <FieldLabel htmlFor="select-small">Compact</FieldLabel>
        <Select
          id="select-small"
          options={fruits}
          defaultValue="apple"
          size="sm"
        />
      </Field>
      <Field data-disabled>
        <FieldLabel htmlFor="select-disabled">Unavailable field</FieldLabel>
        <Select
          id="select-disabled"
          options={fruits}
          defaultValue="apple"
          disabled
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="select-readonly">Read-only choice</FieldLabel>
        <Select
          id="select-readonly"
          options={fruits}
          defaultValue="banana"
          readOnly
        />
        <FieldDescription>
          You can inspect options without changing this choice.
        </FieldDescription>
      </Field>
      <Field data-invalid>
        <FieldLabel htmlFor="select-invalid">Required choice</FieldLabel>
        <Select
          id="select-invalid"
          options={fruits}
          placeholder="Choose a fruit"
          aria-invalid
          aria-describedby="select-invalid-error"
        />
        <FieldError id="select-invalid-error">
          Choose a fruit before continuing.
        </FieldError>
      </Field>
    </div>
  );
}
