"use client";

import { ScrollArea } from "@ajnacloud/ui";

export function ScrollAreaBoth() {
  return (
    <ScrollArea
      orientation="both"
      style={{ height: 240, width: "min(100%, 400px)" }}
      className="rounded-lg border border-[hsl(var(--ajna-border))]"
      viewportProps={{ role: "region", "aria-label": "Seat map" }}
    >
      <div className="grid w-max grid-cols-10 gap-2 p-4">
        {Array.from({ length: 100 }, (_, index) => (
          <div
            key={index}
            className="flex size-12 items-center justify-center rounded-md bg-[hsl(var(--ajna-muted))] text-sm tabular-nums"
          >
            {index + 1}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
