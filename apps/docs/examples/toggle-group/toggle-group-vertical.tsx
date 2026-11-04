"use client";

import { ToggleGroup, ToggleGroupItem } from "@ajnacloud/ui";
import { AlignCenter, AlignLeft, AlignRight } from "lucide-react";

export function ToggleGroupVertical() {
  return (
    <ToggleGroup
      orientation="vertical"
      variant="outline"
      spacing={0}
      aria-label="Text alignment vertically"
      defaultValue={["left"]}
    >
      <ToggleGroupItem value="left" aria-label="Left">
        <AlignLeft aria-hidden="true" />
      </ToggleGroupItem>
      <ToggleGroupItem value="center" aria-label="Center">
        <AlignCenter aria-hidden="true" />
      </ToggleGroupItem>
      <ToggleGroupItem value="right" aria-label="Right">
        <AlignRight aria-hidden="true" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
