"use client";

import { Combobox, Field, FieldLabel, useComboboxAnchor } from "@ajnacloud/ui";
import { useState } from "react";

export function ComboboxManualMultiple() {
  const items = ["Next.js", "SvelteKit", "Nuxt.js", "Remix", "Astro"];
  const [values, setValues] = useState(["Next.js"]);
  const anchor = useComboboxAnchor();
  return (
    <Field className="max-w-sm">
      <FieldLabel htmlFor="combo-manual-multiple">Frameworks</FieldLabel>
      <Combobox.Root
        multiple
        id="combo-manual-multiple"
        items={items}
        value={values}
        onValueChange={setValues}
      >
        <Combobox.InputGroup ref={anchor}>
          <Combobox.Chips>
            {values.map((value) => (
              <Combobox.Chip key={value}>{value}</Combobox.Chip>
            ))}
            <Combobox.ChipsInput placeholder="Add a framework" />
          </Combobox.Chips>
          <Combobox.Clear />
          <Combobox.Trigger />
        </Combobox.InputGroup>
        <Combobox.Content anchor={anchor}>
          <Combobox.Empty>No frameworks found.</Combobox.Empty>
          <Combobox.List>
            {(framework: string) => (
              <Combobox.Item key={framework} value={framework}>
                {framework}
              </Combobox.Item>
            )}
          </Combobox.List>
        </Combobox.Content>
      </Combobox.Root>
    </Field>
  );
}
