"use client";

import { Kbd, KbdGroup } from "@ajnacloud/ui";
import { ArrowUp, CornerDownLeft } from "lucide-react";

export function KbdIcons() {
  return (
    <KbdGroup>
      <Kbd role="img" aria-label="Shift">
        <ArrowUp aria-hidden="true" />
      </Kbd>
      <Kbd role="img" aria-label="Enter">
        <CornerDownLeft aria-hidden="true" />
      </Kbd>
    </KbdGroup>
  );
}
