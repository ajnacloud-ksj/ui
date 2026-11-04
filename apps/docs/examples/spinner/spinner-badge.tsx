"use client";

import { Badge, Spinner } from "@ajnacloud/ui";

export function SpinnerBadge() {
  return (
    <Badge variant="info">
      <Spinner size={12} aria-hidden="true" /> Syncing
    </Badge>
  );
}
