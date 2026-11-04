"use client";

import { Button, Popover } from "@ajnacloud/ui";

export function PopoverPlacement() {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 12,
      }}
    >
      {(["start", "center", "end"] as const).map((align) => (
        <Popover.Root key={align}>
          <Popover.Trigger render={<Button variant="outline" />}>
            {align}
          </Popover.Trigger>
          <Popover.Content align={align} sideOffset={12}>
            <Popover.Title>Aligned to {align}</Popover.Title>
            <Popover.Description>
              The preferred placement adjusts when space is limited.
            </Popover.Description>
          </Popover.Content>
        </Popover.Root>
      ))}
    </div>
  );
}
