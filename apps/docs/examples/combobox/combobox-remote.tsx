"use client";

import {
  Button,
  Combobox,
  Field,
  FieldDescription,
  FieldLabel,
} from "@ajnacloud/ui";
import { useEffect, useRef, useState } from "react";

const people = [
  { id: 0, name: "Ada Shah", email: "ada@example.com", team: "Design" },
  { id: 1, name: "Lin Patel", email: "lin@example.com", team: "Engineering" },
  { id: 2, name: "Sam Morgan", email: "sam@example.com", team: "Operations" },
  { id: 3, name: "Alex Chen", email: "alex@example.com", team: "Engineering" },
];

function searchPeople(query: string, fail: boolean) {
  return new Promise<typeof people>((resolve, reject) => {
    setTimeout(() => {
      if (fail) reject(new Error("The directory is unavailable. Try again."));
      else
        resolve(
          people.filter((person) =>
            `${person.name} ${person.email}`
              .toLowerCase()
              .includes(query.toLowerCase()),
          ),
        );
    }, 350);
  });
}

export function ComboboxRemote() {
  const [value, setValue] = useState<number | null>(0);
  const [selected, setSelected] = useState([people[0]]);
  const [results, setResults] = useState(people);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fail, setFail] = useState(false);
  const request = useRef(0);
  useEffect(
    () => () => {
      request.current += 1;
    },
    [],
  );
  async function search(next: string) {
    const current = ++request.current;
    setQuery(next);
    setLoading(true);
    setError(null);
    try {
      const nextResults = await searchPeople(next, fail);
      if (current === request.current) setResults(nextResults);
    } catch (error) {
      if (current === request.current)
        setError(error instanceof Error ? error.message : "Unable to search.");
    } finally {
      if (current === request.current) setLoading(false);
    }
  }
  return (
    <div className="max-w-sm space-y-4">
      <Field>
        <FieldLabel htmlFor="combo-remote">Directory user</FieldLabel>
        <Combobox
          id="combo-remote"
          options={results}
          selectedOptions={selected}
          getLabel={(person) => person.name}
          getValue={(person) => person.id}
          value={value}
          onValueChange={(next, details) => {
            setValue(next);
            setSelected(details.selectedOptions);
          }}
          inputValue={query}
          onInputValueChange={(next) => {
            void search(next);
          }}
          filterOption={null}
          isLoading={loading}
          isClearable
          placeholder="Search names or emails"
          footer={
            error ? (
              <div className="space-y-2">
                <p role="alert" className="m-0 text-sm">
                  {error}
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    void search(query);
                  }}
                >
                  Retry search
                </Button>
              </div>
            ) : (
              <span className="text-xs">
                {results.length} directory results
              </span>
            )
          }
        />
        <FieldDescription>
          This demo simulates a directory request. Previous selections keep
          their labels when results change.
        </FieldDescription>
      </Field>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={fail}
          onChange={(event) => setFail(event.target.checked)}
        />
        Simulate a failed request
      </label>
    </div>
  );
}
