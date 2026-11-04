"use client";

import { Button, ScrollArea } from "@ajnacloud/ui";
import { useRef } from "react";

export function ScrollAreaProgrammatic() {
  const viewport = useRef<HTMLDivElement>(null);
  return (
    <div className="space-y-3">
      <Button
        variant="outline"
        size="sm"
        onClick={() =>
          viewport.current?.scrollTo({
            top: 0,
            behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
              .matches
              ? "instant"
              : "smooth",
          })
        }
      >
        Back to top
      </Button>
      <ScrollArea
        style={{ height: 180, width: 280 }}
        className="rounded-lg border border-[hsl(var(--ajna-border))]"
        viewportProps={{
          ref: viewport,
          role: "region",
          "aria-label": "Activity history",
        }}
      >
        <ol className="m-0 list-none space-y-3 p-4">
          {Array.from({ length: 20 }, (_, index) => (
            <li key={index} className="text-sm">
              Activity entry {index + 1}
            </li>
          ))}
        </ol>
      </ScrollArea>
    </div>
  );
}
