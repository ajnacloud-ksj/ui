"use client";

import { ScrollArea, Separator } from "@ajnacloud/ui";

export function ScrollAreaVertical() {
  return (
    <ScrollArea
      style={{ height: 240, width: 280 }}
      className="rounded-lg border border-[hsl(var(--ajna-border))]"
      viewportProps={{ role: "region", "aria-label": "Release tags" }}
    >
      <div className="p-4">
        <h3 className="mb-3 text-sm font-medium">Release tags</h3>
        {Array.from({ length: 30 }, (_, index) => (
          <div key={index}>
            <p className="py-2 text-sm">v1.2.0-beta.{30 - index}</p>
            {index < 29 && <Separator />}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
