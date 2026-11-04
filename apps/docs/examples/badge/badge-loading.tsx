"use client";

import { Badge, Spinner } from "@ajnacloud/ui";

export function BadgeLoading() {
  return (
    <Badge variant="outline">
      <Spinner size={12} aria-hidden="true" /> Processing
    </Badge>
  );
}
