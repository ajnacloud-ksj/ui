"use client";

import { Field, FieldLabel, Select } from "@ajnacloud/ui";
import { Palette, Terminal } from "lucide-react";

export function SelectManual() {
  const themes = [
    { label: "Light", value: "light" },
    { label: "Dark", value: "dark" },
    { label: "System", value: "system" },
  ];
  return (
    <Field className="max-w-sm">
      <FieldLabel htmlFor="select-theme">Theme</FieldLabel>
      <Select.Root
        items={[...themes, { label: "Terminal", value: "terminal" }]}
        defaultValue="system"
      >
        <Select.Trigger id="select-theme">
          <Palette size={16} aria-hidden="true" />
          <Select.Value placeholder="Choose a theme" />
        </Select.Trigger>
        <Select.Content>
          <Select.Group>
            <Select.Label>Appearance</Select.Label>
            {themes.map((theme) => (
              <Select.Item key={theme.value} value={theme.value}>
                {theme.label}
              </Select.Item>
            ))}
          </Select.Group>
          <Select.Separator />
          <Select.Group>
            <Select.Label>Other</Select.Label>
            <Select.Item value="terminal">
              <Terminal size={16} aria-hidden="true" />
              Terminal
            </Select.Item>
          </Select.Group>
        </Select.Content>
      </Select.Root>
    </Field>
  );
}
