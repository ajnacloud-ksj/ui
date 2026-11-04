"use client";

import {
  Field,
  FieldLabel,
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@ajnacloud/ui";
import { useState } from "react";

export function InputGroupActions() {
  const [query, setQuery] = useState("");
  return (
    <div style={{ width: "100%", maxWidth: 400 }}>
      <Field>
        <FieldLabel htmlFor="group-search">Search</FieldLabel>
        <InputGroup>
          <InputGroupInput
            id="group-search"
            value={query}
            onValueChange={setQuery}
            placeholder="Search projects"
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton onClick={() => setQuery("")}>
              Clear
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </Field>
    </div>
  );
}
