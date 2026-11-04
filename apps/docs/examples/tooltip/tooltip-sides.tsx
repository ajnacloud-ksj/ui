"use client";

import { Button, Tooltip } from "@ajnacloud/ui";

export function TooltipSides() {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 12,
      }}
    >
      {(["top", "right", "bottom", "left"] as const).map((side) => (
        <Tooltip.Root key={side}>
          <Tooltip.Trigger render={<Button variant="outline" />}>
            {side}
          </Tooltip.Trigger>
          <Tooltip.Content side={side}>
            Appears on the {side} when space allows.
          </Tooltip.Content>
        </Tooltip.Root>
      ))}
    </div>
  );
}
