"use client";

import { Field, FieldDescription, FieldLabel, Select } from "@ajnacloud/ui";

export function SelectScrollable() {
  const options = Array.from({ length: 50 }, (_, index) => ({
    label: `Project ${index + 1}`,
    value: `project-${index + 1}`,
  }));
  return (
    <Field className="max-w-sm">
      <FieldLabel htmlFor="select-scroll">Project</FieldLabel>
      <Select
        id="select-scroll"
        options={options}
        defaultValue="project-25"
        contentProps={{ alignItemWithTrigger: false, className: "max-h-64" }}
      />
      <FieldDescription>
        Scroll or type a project name while the list is open to move to a
        matching option.
      </FieldDescription>
    </Field>
  );
}
