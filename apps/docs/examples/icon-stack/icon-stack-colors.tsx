"use client";

import { IconStack } from "@ajnacloud/ui";
import { Sparkles } from "lucide-react";

const stacks = [
  { label: "Neutral", className: "text-ajna-foreground" },
  { label: "Primary", className: "text-ajna-primary" },
  { label: "Success", className: "text-ajna-success" },
  { label: "Warning", className: "text-ajna-warning" },
  { label: "Destructive", className: "text-ajna-destructive-text" },
  { label: "Info", className: "text-ajna-info" },
];

export function IconStackColors() {
  return (
    <div className="flex flex-wrap items-end justify-center gap-7">
      {stacks.map((item) => (
        <div key={item.label} className="flex flex-col items-center gap-2">
          <IconStack aria-hidden="true" className={item.className}>
            <Sparkles className="size-4" />
          </IconStack>
          <span className="text-sm text-ajna-muted-foreground">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}
