"use client";

import { Separator } from "@ajnacloud/ui";

export function SeparatorList() {
  return (
    <div style={{ display: "grid", gap: 16, width: "100%", maxWidth: 400 }}>
      <div>
        <strong>Workspace</strong>
        <p style={{ margin: "4px 0 0" }}>Manage members and permissions.</p>
      </div>
      <Separator />
      <div>
        <strong>Billing</strong>
        <p style={{ margin: "4px 0 0" }}>Manage your plan and invoices.</p>
      </div>
    </div>
  );
}
