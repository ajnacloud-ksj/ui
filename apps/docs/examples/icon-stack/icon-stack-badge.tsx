"use client";

import { IconStack } from "@ajnacloud/ui";
import { Check } from "lucide-react";

export function IconStackBadge() {
  return (
    <IconStack aria-hidden="true" className="h-24 w-[5.5rem] text-ajna-primary">
      <span className="flex size-8 items-center justify-center rounded-full border border-ajna-border bg-ajna-background text-ajna-primary shadow-sm">
        <Check className="size-4" />
      </span>
    </IconStack>
  );
}
