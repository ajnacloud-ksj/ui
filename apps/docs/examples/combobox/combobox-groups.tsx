"use client";

import { Combobox, Field, FieldDescription, FieldLabel } from "@ajnacloud/ui";

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

export function ComboboxGroups() {
  return (
    <Field className="max-w-sm">
      <FieldLabel htmlFor="combo-grouped">Workspace project</FieldLabel>
      <Combobox
        id="combo-grouped"
        options={projects}
        groupBy={(project) => project.group}
        placeholder="Find a project"
        isClearable
      />
      <FieldDescription>
        Archived workspaces are visible but unavailable.
      </FieldDescription>
    </Field>
  );
}
