"use client";

import { Button, Tooltip } from "@ajnacloud/ui";
import { useId, useState } from "react";

export function TooltipControlled() {
  const [open, setOpen] = useState(false);
  const triggerId = useId();
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 12,
      }}
    >
      <Tooltip.Root open={open} onOpenChange={setOpen} triggerId={triggerId}>
        <Tooltip.Trigger id={triggerId} render={<Button variant="outline" />}>
          Preview
        </Tooltip.Trigger>
        <Tooltip.Content showArrow={false}>
          Review your changes before publishing.
        </Tooltip.Content>
      </Tooltip.Root>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Show explanation
      </Button>
      <Button variant="secondary" onClick={() => setOpen(false)}>
        Hide explanation
      </Button>
    </div>
  );
}
