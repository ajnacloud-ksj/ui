"use client";

import {
  Button,
  Combobox,
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@ajnacloud/ui";
import { useState } from "react";

const projects = [
  { label: "Website redesign", value: "website", group: "Design" },
  { label: "Component library", value: "library", group: "Design" },
  { label: "Customer portal", value: "portal", group: "Engineering" },
  { label: "Data pipeline", value: "data", group: "Engineering" },
  { label: "Release planning", value: "release", group: "Operations" },
  {
    label: "Archived workspace",
    value: "archived",
    group: "Operations",
    disabled: true,
  },
];

export function ComboboxForm() {
  const [value, setValue] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const [submitted, setSubmitted] = useState<string | null>(null);
  const invalid = touched && value === null;
  return (
    <form
      className="max-w-sm space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(String(new FormData(event.currentTarget).get("project")));
      }}
      onReset={() => {
        setValue(null);
        setTouched(false);
        setSubmitted(null);
      }}
    >
      <Field data-invalid={invalid || undefined}>
        <FieldLabel htmlFor="combo-form" required>
          Project
        </FieldLabel>
        <Combobox
          id="combo-form"
          name="project"
          options={projects}
          value={value}
          onValueChange={setValue}
          onBlur={() => setTouched(true)}
          required
          isClearable
          aria-invalid={invalid || undefined}
          aria-describedby={
            invalid
              ? "combo-form-description combo-form-error"
              : "combo-form-description"
          }
          placeholder="Choose a project"
        />
        <FieldDescription id="combo-form-description">
          Searching alone does not choose a project.
        </FieldDescription>
        {invalid && (
          <FieldError id="combo-form-error">
            Choose a project to continue.
          </FieldError>
        )}
      </Field>
      <div className="flex gap-2">
        <Button type="submit" variant="primary">
          Save project
        </Button>
        <Button variant="secondary" type="reset">
          Reset form
        </Button>
      </div>
      {submitted && (
        <output className="text-sm">
          Submitted project value: {submitted}
        </output>
      )}
    </form>
  );
}
