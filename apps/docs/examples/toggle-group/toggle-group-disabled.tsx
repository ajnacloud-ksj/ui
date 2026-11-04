"use client";

import { ToggleGroup, ToggleGroupItem } from "@ajnacloud/ui";

export function ToggleGroupDisabled() {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <ToggleGroup multiple aria-label="Available formatting" variant="outline">
        <ToggleGroupItem value="bold">Bold</ToggleGroupItem>
        <ToggleGroupItem value="italic" disabled>
          Italic
        </ToggleGroupItem>
        <ToggleGroupItem value="underline">Underline</ToggleGroupItem>
      </ToggleGroup>
      <ToggleGroup
        disabled
        multiple
        defaultValue={["bold"]}
        aria-label="Formatting unavailable"
        variant="outline"
      >
        <ToggleGroupItem value="bold">Bold</ToggleGroupItem>
        <ToggleGroupItem value="italic">Italic</ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
