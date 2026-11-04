"use client";

import { Combobox, Field, FieldLabel } from "@ajnacloud/ui";

export function ComboboxManualGroups() {
  const groups = [
    { value: "Europe", items: ["London", "Paris", "Berlin"] },
    { value: "Asia", items: ["Mumbai", "Tokyo", "Singapore"] },
  ];
  return (
    <Field className="max-w-sm">
      <FieldLabel htmlFor="combo-cities">City</FieldLabel>
      <Combobox.Root id="combo-cities" items={groups}>
        <Combobox.Input placeholder="Choose a city" />
        <Combobox.Content>
          <Combobox.Empty>No cities found.</Combobox.Empty>
          <Combobox.List>
            {(group: (typeof groups)[number]) => (
              <Combobox.Group key={group.value} items={group.items}>
                <Combobox.GroupLabel>{group.value}</Combobox.GroupLabel>
                <Combobox.Collection>
                  {(city: string) => (
                    <Combobox.Item key={city} value={city}>
                      {city}
                    </Combobox.Item>
                  )}
                </Combobox.Collection>
                <Combobox.Separator />
              </Combobox.Group>
            )}
          </Combobox.List>
        </Combobox.Content>
      </Combobox.Root>
    </Field>
  );
}
