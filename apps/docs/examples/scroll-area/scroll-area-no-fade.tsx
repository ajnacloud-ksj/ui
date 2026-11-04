"use client";

import { ScrollArea } from "@ajnacloud/ui";

export function ScrollAreaNoFade() {
  return (
    <ScrollArea
      fade={false}
      style={{ height: 180, width: 280 }}
      className="rounded-lg border border-[hsl(var(--ajna-border))]"
      viewportProps={{ role: "region", "aria-label": "Notifications" }}
    >
      <ul className="m-0 list-none divide-y divide-[hsl(var(--ajna-border))] p-0">
        {Array.from({ length: 12 }, (_, index) => (
          <li key={index} className="p-3 text-sm">
            Notification {index + 1}
          </li>
        ))}
      </ul>
    </ScrollArea>
  );
}
