"use client";

import { Badge } from "@ajnacloud/ui";

export function BadgeVariants() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
      <Badge variant="default">New</Badge>
      <Badge variant="secondary">Draft</Badge>
      <Badge variant="destructive">Failed</Badge>
      <Badge variant="success">Active</Badge>
      <Badge variant="warning">Pending</Badge>
      <Badge variant="info">In progress</Badge>
      <Badge variant="outline">Archived</Badge>
      <Badge variant="ghost">Internal</Badge>
      <Badge variant="link">Reference</Badge>
    </div>
  );
}
