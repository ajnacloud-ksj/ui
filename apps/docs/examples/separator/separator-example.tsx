"use client";

import { Separator } from "@ajnacloud/ui";

export function SeparatorExample() {
  return (
    <div style={{ width: "100%", maxWidth: 400, display: "grid", gap: 16 }}>
      <span>Project settings</span>
      <Separator />
      <span>Workspace preferences</span>
    </div>
  );
}
