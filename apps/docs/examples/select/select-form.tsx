"use client";

import { Button, Field, FieldLabel, Select } from "@ajnacloud/ui";
import { useState } from "react";

const fruits = [
  { label: "Apple", value: "apple", category: "Everyday" },
  { label: "Banana", value: "banana", category: "Everyday" },
  { label: "Blueberry", value: "blueberry", category: "Berries" },
  { label: "Strawberry", value: "strawberry", category: "Berries" },
  { label: "Grapes", value: "grapes", category: "Seasonal", disabled: true },
];

export function SelectForm() {
  const [fruit, setFruit] = useState<string | null>(null);
  const [extras, setExtras] = useState<string[]>([]);
  const [result, setResult] = useState("");
  return (
    <form
      className="max-w-sm space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setResult(
          JSON.stringify({
            fruit: data.get("fruit"),
            extras: data.getAll("extras"),
          }),
        );
      }}
      onReset={() => {
        setFruit(null);
        setExtras([]);
        setResult("");
      }}
    >
      <Field>
        <FieldLabel htmlFor="select-form-fruit" required>
          Fruit
        </FieldLabel>
        <Select
          id="select-form-fruit"
          options={fruits}
          name="fruit"
          required
          value={fruit}
          onValueChange={setFruit}
          placeholder="Choose a fruit"
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="select-form-extras">Extra fruits</FieldLabel>
        <Select
          id="select-form-extras"
          options={fruits}
          name="extras"
          multiple
          value={extras}
          onValueChange={setExtras}
          placeholder="Optional extras"
        />
      </Field>
      <div className="flex gap-2">
        <Button type="submit">Save delivery</Button>
        <Button type="reset" variant="outline">
          Reset
        </Button>
      </div>
      {result && (
        <output className="block text-sm break-words">{result}</output>
      )}
    </form>
  );
}
