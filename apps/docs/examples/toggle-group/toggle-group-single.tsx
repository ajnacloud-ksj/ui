"use client";

import { ToggleGroup, ToggleGroupItem } from "@ajnacloud/ui";
import { AlignCenter, AlignLeft, AlignRight } from "lucide-react";
import { useState } from "react";

export function ToggleGroupSingle() {
  const [alignment, setAlignment] = useState<string[]>(["left"]);
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <ToggleGroup
        value={alignment}
        onValueChange={setAlignment}
        aria-label="Text alignment"
        variant="outline"
        spacing={0}
      >
        <ToggleGroupItem value="left" aria-label="Align left">
          <AlignLeft aria-hidden="true" />
        </ToggleGroupItem>
        <ToggleGroupItem value="center" aria-label="Align center">
          <AlignCenter aria-hidden="true" />
        </ToggleGroupItem>
        <ToggleGroupItem value="right" aria-label="Align right">
          <AlignRight aria-hidden="true" />
        </ToggleGroupItem>
      </ToggleGroup>
      <span>Alignment: {alignment[0] ?? "none"}</span>
    </div>
  );
}
