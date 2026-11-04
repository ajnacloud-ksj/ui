"use client";

import { Combobox, Field, FieldDescription, FieldLabel } from "@ajnacloud/ui";
import { UserRound } from "lucide-react";
import { useState } from "react";

const people = [
  { id: 0, name: "Ada Shah", email: "ada@example.com", team: "Design" },
  { id: 1, name: "Lin Patel", email: "lin@example.com", team: "Engineering" },
  { id: 2, name: "Sam Morgan", email: "sam@example.com", team: "Operations" },
  { id: 3, name: "Alex Chen", email: "alex@example.com", team: "Engineering" },
];

export function ComboboxCustom() {
  const [value, setValue] = useState<number | null>(0);
  return (
    <Field className="max-w-sm">
      <FieldLabel htmlFor="combo-person">Project owner</FieldLabel>
      <Combobox
        id="combo-person"
        options={people}
        getLabel={(person) => person.name}
        getValue={(person) => person.id}
        value={value}
        onValueChange={setValue}
        isClearable
        renderOption={(person, state) => (
          <div className="flex min-w-0 items-center gap-3">
            <UserRound aria-hidden="true" className="size-4" />
            <div className="min-w-0">
              <div className="truncate">{person.name}</div>
              <div className="truncate text-xs opacity-70">{person.email}</div>
            </div>
            {state.selected && <span className="sr-only">Selected</span>}
          </div>
        )}
        renderSelectedOption={({ option, label }) => (
          <span className="flex min-w-0 items-center gap-2">
            <UserRound aria-hidden="true" size={14} />
            <span className="truncate">{option?.name ?? label}</span>
          </span>
        )}
      />
      <FieldDescription>
        Numeric values stay numeric, including zero.
      </FieldDescription>
    </Field>
  );
}
