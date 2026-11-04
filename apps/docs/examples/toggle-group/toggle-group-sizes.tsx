"use client";

import { ToggleGroup, ToggleGroupItem } from "@ajnacloud/ui";

export function ToggleGroupSizes() {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      {(["sm", "base", "lg"] as const).map((size) => (
        <ToggleGroup
          key={size}
          aria-label={`View ${size}`}
          variant="outline"
          size={size}
          defaultValue={["list"]}
        >
          <ToggleGroupItem value="list">List</ToggleGroupItem>
          <ToggleGroupItem value="grid">Grid</ToggleGroupItem>
        </ToggleGroup>
      ))}
    </div>
  );
}
