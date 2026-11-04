"use client";

import { Badge } from "@ajnacloud/ui";
import { BadgeCheck } from "lucide-react";

export function BadgeIcons() {
  return (
    <Badge variant="secondary">
      <BadgeCheck aria-hidden="true" /> Verified
    </Badge>
  );
}
