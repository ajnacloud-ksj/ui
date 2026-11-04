"use client";

import { Badge } from "@ajnacloud/ui";

export function BadgeExample() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
      <Badge>New</Badge>
      <Badge variant="secondary">Draft</Badge>
      <Badge variant="outline">Archived</Badge>
    </div>
  );
}
