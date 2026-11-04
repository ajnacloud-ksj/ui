"use client";

import { Field, FieldLabel, SearchInput } from "@ajnacloud/ui";
import { useId, useState } from "react";

export function SearchInputExample() {
  const id = useId();
  const [query, setQuery] = useState("");
  const projects = ["Website", "API", "Dashboard"];
  const matches = projects.filter((name) =>
    name.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <div style={{ display: "grid", gap: 16, width: "100%", maxWidth: 360 }}>
      <Field>
        <FieldLabel htmlFor={id}>Find a project</FieldLabel>
        <SearchInput
          id={id}
          value={query}
          onValueChange={setQuery}
          placeholder="Search projects…"
        />
      </Field>
      <span>
        {matches.length ? matches.join(", ") : "No matching projects."}
      </span>
    </div>
  );
}
