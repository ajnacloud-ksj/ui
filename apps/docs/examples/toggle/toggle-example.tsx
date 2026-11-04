"use client";

import { Toggle } from "@ajnacloud/ui";
import { Bold } from "lucide-react";

export function ToggleExample() {
  return (
    <Toggle aria-label="Bold" defaultPressed>
      <Bold aria-hidden="true" />
    </Toggle>
  );
}
