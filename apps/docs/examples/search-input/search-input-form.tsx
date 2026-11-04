"use client";

import { Button, Field, FieldLabel, SearchInput } from "@ajnacloud/ui";
import { useId, useState } from "react";

export function SearchInputForm() {
  const id = useId();
  const [result, setResult] = useState("");
  return (
    <form
      role="search"
      aria-label="Documentation search"
      style={{ display: "grid", gap: 16, width: "100%", maxWidth: 360 }}
      onReset={() => setResult("")}
      onSubmit={(event) => {
        event.preventDefault();
        setResult(
          `Searching for: ${new FormData(event.currentTarget).get("query")}`,
        );
      }}
    >
      <Field>
        <FieldLabel htmlFor={id}>Search documentation</FieldLabel>
        <SearchInput id={id} name="query" defaultValue="Button" />
      </Field>
      <div style={{ display: "flex", gap: 12 }}>
        <Button type="submit">Search docs</Button>
        <Button variant="secondary" type="reset">
          Reset search
        </Button>
      </div>
      <span role="status">{result}</span>
    </form>
  );
}
