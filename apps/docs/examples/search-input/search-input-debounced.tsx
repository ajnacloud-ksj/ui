"use client";

import {
  Field,
  FieldDescription,
  FieldLabel,
  SearchInput,
} from "@ajnacloud/ui";
import { useEffect, useId, useState } from "react";

export function SearchInputDebounced() {
  const id = useId();
  const [query, setQuery] = useState("");
  const [settled, setSettled] = useState("");
  useEffect(() => {
    const timer = window.setTimeout(() => setSettled(query), 300);
    return () => window.clearTimeout(timer);
  }, [query]);
  return (
    <Field style={{ maxWidth: 360 }}>
      <FieldLabel htmlFor={id}>Filter the project list</FieldLabel>
      <SearchInput
        id={id}
        value={query}
        onValueChange={setQuery}
        aria-describedby={`${id}-help`}
      />
      <FieldDescription id={`${id}-help`}>
        Search projects by name.
      </FieldDescription>
      <span>Applied query: {settled || "all projects"}</span>
    </Field>
  );
}
