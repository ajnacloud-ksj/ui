"use client";

import { Badge } from "@ajnacloud/ui";
import { ArrowUpRight } from "lucide-react";

export function BadgeLink() {
  return (
    <Badge
      variant="outline"
      render={
        <a href="/docs/components/radio-group">
          Radio Group <ArrowUpRight aria-hidden="true" />
        </a>
      }
    />
  );
}
