"use client";

import { Combobox, Field, FieldDescription, FieldLabel } from "@ajnacloud/ui";
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

export function ComboboxBasic() {
  const [value, setValue] = useState<string | null>(null);
  return (
    <Field className="max-w-sm">
      <FieldLabel htmlFor="combo-project">Project</FieldLabel>
      <Combobox
        id="combo-project"
        options={projects}
        value={value}
        onValueChange={setValue}
        isClearable
        placeholder="Choose a project"
      />
      <FieldDescription>
        Choose an existing project or type to filter the list.
      </FieldDescription>
      <output className="text-xs opacity-70">
        Selected value: {value ?? "none"}
      </output>
    </Field>
  );
}
