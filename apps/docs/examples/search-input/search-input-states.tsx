"use client";

import { Field, FieldLabel, SearchInput } from "@ajnacloud/ui";
import { useId } from "react";

export function SearchInputStates() {
  const id = useId();
  return (
    <div style={{ display: "grid", gap: 20, width: "100%", maxWidth: 360 }}>
      <Field>
        <FieldLabel htmlFor={`${id}-disabled`}>Unavailable search</FieldLabel>
        <SearchInput id={`${id}-disabled`} defaultValue="Website" disabled />
      </Field>
      <Field>
        <FieldLabel htmlFor={`${id}-readonly`}>Fixed query</FieldLabel>
        <SearchInput id={`${id}-readonly`} defaultValue="API" readOnly />
      </Field>
      <Field>
        <FieldLabel htmlFor={`${id}-clear`}>Custom clear label</FieldLabel>
        <SearchInput
          id={`${id}-clear`}
          defaultValue="Dashboard"
          clearLabel="Clear project query"
        />
      </Field>
    </div>
  );
}
