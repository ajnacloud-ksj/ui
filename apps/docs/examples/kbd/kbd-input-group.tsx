"use client";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  Kbd,
} from "@ajnacloud/ui";
import { useState } from "react";

export function KbdInputGroup() {
  const [query, setQuery] = useState("");
  return (
    <form
      style={{ width: "100%", maxWidth: 360 }}
      onSubmit={(event) => {
        event.preventDefault();
        setQuery(String(new FormData(event.currentTarget).get("query")));
      }}
    >
      <InputGroup>
        <InputGroupInput
          name="query"
          aria-label="Search projects"
          placeholder="Search projects…"
        />
        <InputGroupAddon align="inline-end">
          <Kbd>Enter</Kbd>
        </InputGroupAddon>
      </InputGroup>
      <p role="status">{query && `Submitted search: ${query}`}</p>
    </form>
  );
}
