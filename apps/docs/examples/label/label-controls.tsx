"use client";

import { Checkbox, Input, Label } from "@ajnacloud/ui";

export function LabelControls() {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Checkbox id="label-terms" />
        <Label htmlFor="label-terms">Accept terms</Label>
      </div>
      <div style={{ display: "grid", gap: 8 }}>
        <Label htmlFor="label-disabled" data-disabled>
          Account ID
        </Label>
        <Input id="label-disabled" disabled defaultValue="AJNA-001" />
      </div>
    </div>
  );
}
