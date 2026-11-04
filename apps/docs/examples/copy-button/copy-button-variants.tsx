"use client";

import { CopyButton } from "@ajnacloud/ui";

export function CopyButtonVariants() {
  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <CopyButton value="https://example.com/invite" variant="secondary">
        Copy invite link
      </CopyButton>
      <CopyButton value="npm install @ajnacloud/ui" variant="outline" size="sm">
        Copy command
      </CopyButton>
      <CopyButton value="unavailable" disabled>
        Copy unavailable link
      </CopyButton>
    </div>
  );
}
