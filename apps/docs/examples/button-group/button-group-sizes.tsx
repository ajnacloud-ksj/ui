"use client";

import { Button, ButtonGroup } from "@ajnacloud/ui";

export function ButtonGroupSizes() {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      {(["xs", "sm", "base", "lg"] as const).map((size) => (
        <ButtonGroup key={size} aria-label={`${size} actions`}>
          <Button variant="secondary" size={size}>
            Copy
          </Button>
          <Button variant="secondary" size={size}>
            Paste
          </Button>
        </ButtonGroup>
      ))}
    </div>
  );
}
