"use client";

import { Button, Tooltip } from "@ajnacloud/ui";

export function TooltipDisabledAction() {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger
        render={
          <span tabIndex={0} role="group" aria-label="Publish unavailable" />
        }
      >
        <Button variant="secondary" disabled style={{ pointerEvents: "none" }}>
          Publish
        </Button>
      </Tooltip.Trigger>
      <Tooltip.Content>Add a project name before publishing.</Tooltip.Content>
    </Tooltip.Root>
  );
}
