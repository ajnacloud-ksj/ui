"use client";

import { Combobox, Field, FieldLabel, InputGroupAddon } from "@ajnacloud/ui";
import { Globe } from "lucide-react";

export function ComboboxManual() {
  const items = ["Next.js", "SvelteKit", "Nuxt.js", "Remix", "Astro"];
  return (
    <Field className="max-w-sm">
      <FieldLabel htmlFor="combo-manual">Framework</FieldLabel>
      <Combobox.Root items={items} id="combo-manual" autoHighlight>
        <Combobox.Input showClear placeholder="Choose a framework">
          <InputGroupAddon align="inline-start">
            <Globe aria-hidden="true" size={14} />
          </InputGroupAddon>
        </Combobox.Input>
        <Combobox.Content>
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
