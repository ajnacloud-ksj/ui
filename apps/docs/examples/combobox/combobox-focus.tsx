"use client";

import {
  Button,
  Combobox,
  Field,
  FieldDescription,
  FieldLabel,
} from "@ajnacloud/ui";
import { useRef, useState } from "react";

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

export function ComboboxFocus() {
  const ref = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);
  return (
    <div className="max-w-sm space-y-4">
      <Field>
        <FieldLabel htmlFor="combo-focus">Project</FieldLabel>
        <Combobox
          ref={ref}
          id="combo-focus"
          options={projects}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Search projects"
          footer={
            <Button variant="secondary" size="sm">
              Footer action
            </Button>
          }
        />
        <FieldDescription>
          Focus in the popup belongs to this field too.
        </FieldDescription>
      </Field>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => ref.current?.focus({ preventScroll: true })}
        >
          Focus input
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => ref.current?.blur()}
        >
          Blur input
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            ref.current?.focus();
            ref.current?.select();
          }}
        >
          Select search text
        </Button>
      </div>
      <output className="text-sm">
        {focused ? "Focus is inside the field" : "Focus is outside the field"}
      </output>
    </div>
  );
}
