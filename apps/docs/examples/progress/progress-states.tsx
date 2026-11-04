"use client";

import { Progress, ProgressLabel, ProgressValue } from "@ajnacloud/ui";

export function ProgressStates() {
  return (
    <div style={{ width: "100%", maxWidth: 400, display: "grid", gap: 20 }}>
      <Progress value={0}>
        <ProgressLabel>Waiting to upload</ProgressLabel>
        <ProgressValue />
      </Progress>
      <Progress value={100}>
        <ProgressLabel>Upload complete</ProgressLabel>
        <ProgressValue />
      </Progress>
    </div>
  );
}
