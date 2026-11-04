"use client";

import { ToggleGroup, ToggleGroupItem } from "@ajnacloud/ui";
import { Bold, Italic, Underline } from "lucide-react";

export function ToggleGroupExample() {
  return (
    <ToggleGroup multiple defaultValue={["bold"]} aria-label="Text formatting">
      <ToggleGroupItem value="bold" aria-label="Bold">
        <Bold aria-hidden="true" />
      </ToggleGroupItem>
      <ToggleGroupItem value="italic" aria-label="Italic">
        <Italic aria-hidden="true" />
      </ToggleGroupItem>
      <ToggleGroupItem value="underline" aria-label="Underline">
        <Underline aria-hidden="true" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
