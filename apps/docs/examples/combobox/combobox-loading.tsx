"use client";

import { Button, Combobox, Field, FieldLabel } from "@ajnacloud/ui";
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

export function ComboboxLoading() {
  const [loading, setLoading] = useState(true);
  return (
    <div className="grid max-w-sm gap-4">
      <Field>
        <FieldLabel htmlFor="combo-initial-load">Initial loading</FieldLabel>
        <Combobox
          id="combo-initial-load"
          options={loading ? [] : projects}
          isLoading={loading}
          placeholder="Search projects"
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="combo-background-load">
          Refreshing results
        </FieldLabel>
        <Combobox
          id="combo-background-load"
          options={projects}
          isLoading={loading}
          placeholder="Existing results stay available"
        />
      </Field>
      <Button variant="secondary" onClick={() => setLoading((value) => !value)}>
        {loading ? "Finish loading" : "Start loading"}
      </Button>
    </div>
  );
}
