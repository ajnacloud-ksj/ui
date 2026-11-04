"use client";

import {
  Button,
  Field,
  FieldDescription,
  FieldLabel,
  SearchInput,
} from "@ajnacloud/ui";
import { useEffect, useId, useState } from "react";

export function SearchInputLoading() {
  const id = useId();
  const [query, setQuery] = useState("Garden");
  const [request, setRequest] = useState<{ query: string } | null>(null);
  const [results, setResults] = useState<string[] | null>(null);
  const loading = request !== null;
  useEffect(() => {
    if (!request) return;
    const timer = window.setTimeout(() => {
      const inventory = ["Garden hose", "Garden gloves", "Pruning shears"];
      setResults(
        inventory.filter((item) =>
          item.toLowerCase().includes(request.query.trim().toLowerCase()),
        ),
      );
      setRequest(null);
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [request]);
  return (
    <form
      role="search"
      aria-label="Inventory search example"
      style={{ display: "grid", gap: 16, width: "100%", maxWidth: 360 }}
      onSubmit={(event) => {
        event.preventDefault();
        setRequest({ query });
      }}
    >
      <Field>
        <FieldLabel htmlFor={id}>Search inventory</FieldLabel>
        <SearchInput
          id={id}
          value={query}
          onValueChange={setQuery}
          loading={loading}
          aria-describedby={`${id}-help`}
        />
        <FieldDescription id={`${id}-help`}>
          Search inventory by product name or category.
        </FieldDescription>
      </Field>
      <Button type="submit" loading={loading}>
        Search inventory
      </Button>
      <span role="status">
        {loading
          ? "Searching inventory…"
          : results === null
            ? "Ready to search."
            : results.length
              ? `Found: ${results.join(", ")}.`
              : "No matching inventory."}
      </span>
    </form>
  );
}
