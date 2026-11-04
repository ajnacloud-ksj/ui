"use client";

import { CopyButton } from "@ajnacloud/ui";

export function CopyButtonExample() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        flexWrap: "wrap",
      }}
    >
      <code>npm install @ajnacloud/ui</code>
      <CopyButton
        value="npm install @ajnacloud/ui"
        copyLabel="Copy install command"
      />
    </div>
  );
}
