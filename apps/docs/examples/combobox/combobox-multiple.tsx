"use client";

import { Combobox, Field, FieldLabel } from "@ajnacloud/ui";
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

export function ComboboxMultiple() {
  const [values, setValues] = useState([
    "website",
    "library",
    "portal",
    "data",
  ]);
  return (
    <div className="grid max-w-lg gap-6">
      {(["pills", "names", "count"] as const).map((display) => (
        <Field key={display}>
          <FieldLabel htmlFor={`combo-${display}`}>
            {display === "pills"
              ? "Removable pills"
              : display === "names"
                ? "Names and overflow"
                : "Selection count"}
          </FieldLabel>
          <Combobox
            id={`combo-${display}`}
            multiple
            options={projects}
            value={values}
            onValueChange={setValues}
            selectionDisplay={display}
            maxVisibleSelections={2}
            isClearable
            placeholder="Choose projects"
          />
        </Field>
      ))}
    </div>
  );
}
