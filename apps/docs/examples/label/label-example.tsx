"use client";

import { Input, Label } from "@ajnacloud/ui";

export function LabelExample() {
  return (
    <div style={{ display: "grid", gap: 8, width: "100%", maxWidth: 400 }}>
      <Label htmlFor="label-email">Email</Label>
      <Input id="label-email" type="email" placeholder="you@example.com" />
    </div>
  );
}
