"use client";

import { Combobox, Field, FieldError, FieldLabel } from "@ajnacloud/ui";

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

export function ComboboxStates() {
  return (
    <div className="grid max-w-sm gap-5">
      <Field>
        <FieldLabel htmlFor="combo-small">Small control</FieldLabel>
        <Combobox
          id="combo-small"
          options={projects}
          size="sm"
          placeholder="Choose a project"
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="combo-disabled">Disabled</FieldLabel>
        <Combobox
          id="combo-disabled"
          options={projects}
          defaultValue="website"
          disabled
          isClearable
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="combo-readonly">Read only</FieldLabel>
        <Combobox
          id="combo-readonly"
          options={projects}
          defaultValue="library"
          readOnly
          isClearable
        />
      </Field>
      <Field data-invalid="true">
        <FieldLabel htmlFor="combo-invalid">Required project</FieldLabel>
        <Combobox
          id="combo-invalid"
          options={projects}
          aria-invalid="true"
          aria-describedby="combo-invalid-error"
          placeholder="Choose a project"
        />
        <FieldError id="combo-invalid-error">
          Choose a project to continue.
        </FieldError>
      </Field>
    </div>
  );
}
