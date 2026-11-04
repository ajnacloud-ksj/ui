"use client";

import { Progress } from "@ajnacloud/ui";

export function ProgressExample() {
  return (
    <Progress
      value={42}
      aria-label="Uploading project"
      style={{ maxWidth: 400 }}
    />
  );
}
