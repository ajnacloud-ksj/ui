"use client";

import { Toggle } from "@ajnacloud/ui";
import { Bold } from "lucide-react";

export function ToggleSizes() {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 12,
      }}
    >
      {(["sm", "base", "lg"] as const).map((size) => (
        <Toggle
          key={size}
          size={size}
          variant="outline"
          aria-label={`Bold ${size}`}
        >
          <Bold aria-hidden="true" />
        </Toggle>
      ))}
    </div>
  );
}
