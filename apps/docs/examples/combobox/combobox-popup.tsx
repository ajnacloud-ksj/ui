"use client";

import { Button, Combobox, Field, FieldLabel } from "@ajnacloud/ui";

export function ComboboxPopup() {
  const items = ["English", "Hindi", "French", "Japanese"];
  return (
    <Field className="max-w-sm">
      <FieldLabel htmlFor="combo-language">Language</FieldLabel>
      <Combobox.Root items={items}>
        <Combobox.Trigger
          id="combo-language"
          render={<Button variant="outline" />}
          className="h-9 w-full justify-between px-3"
        >
          <Combobox.Value placeholder="Choose a language" />
        </Combobox.Trigger>
        <Combobox.Content>
          <Combobox.Input
            aria-label="Search languages"
            placeholder="Search languages"
            showTrigger={false}
          />
          <Combobox.Empty>No languages found.</Combobox.Empty>
          <Combobox.List>
            {(language: string) => (
              <Combobox.Item key={language} value={language}>
                {language}
              </Combobox.Item>
            )}
          </Combobox.List>
        </Combobox.Content>
      </Combobox.Root>
    </Field>
  );
}
