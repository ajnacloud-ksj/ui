"use client";

import { Toggle } from "@ajnacloud/ui";
import { Bold, Italic } from "lucide-react";

export function ToggleDisabled() {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 12,
      }}
    >
      <Toggle disabled aria-label="Bold unavailable">
        <Bold aria-hidden="true" />
      </Toggle>
      <Toggle
        disabled
        defaultPressed
        variant="outline"
        aria-label="Italic unavailable"
      >
        <Italic aria-hidden="true" />
      </Toggle>
    </div>
  );
}
