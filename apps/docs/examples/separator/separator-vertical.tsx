"use client";

import { Separator } from "@ajnacloud/ui";

export function SeparatorVertical() {
  return (
    <div style={{ display: "flex", height: 24, alignItems: "center", gap: 16 }}>
      <span>Profile</span>
      <Separator orientation="vertical" />
      <span>Settings</span>
      <Separator orientation="vertical" />
      <span>Help</span>
    </div>
  );
}
