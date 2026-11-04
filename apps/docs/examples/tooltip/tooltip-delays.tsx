"use client";

import { Button, Tooltip } from "@ajnacloud/ui";
import { Copy, Download } from "lucide-react";

export function TooltipDelays() {
  return (
    <Tooltip.Provider delay={400} timeout={500}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 12,
        }}
      >
        <Tooltip.Root>
          <Tooltip.Trigger
            render={<Button variant="secondary" icon={<Copy />} />}
          >
            Copy
          </Tooltip.Trigger>
          <Tooltip.Content>Copy the project URL</Tooltip.Content>
        </Tooltip.Root>
        <Tooltip.Root>
          <Tooltip.Trigger
            render={<Button variant="secondary" icon={<Download />} />}
          >
            Export
          </Tooltip.Trigger>
          <Tooltip.Content>Download a copy</Tooltip.Content>
        </Tooltip.Root>
      </div>
    </Tooltip.Provider>
  );
}
