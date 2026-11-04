"use client";

import { IconStack } from "@ajnacloud/ui";
import { Archive, Layers, Package } from "lucide-react";

const sizes = [
  {
    label: "Small",
    className: "h-16 w-14",
    icon: <Archive className="size-3.5" />,
  },
  {
    label: "Default",
    className: "h-20 w-[4.5rem]",
    icon: <Package className="size-4" />,
  },
  {
    label: "Large",
    className: "h-28 w-24",
    icon: <Layers className="size-6" />,
  },
];

export function IconStackSizes() {
  return (
    <div className="flex flex-wrap items-end justify-center gap-8">
      {sizes.map((item) => (
        <div key={item.label} className="flex flex-col items-center gap-2">
          <IconStack aria-hidden="true" className={item.className}>
            {item.icon}
          </IconStack>
          <span className="text-sm text-ajna-muted-foreground">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}
