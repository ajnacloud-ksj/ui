"use client";

import { Progress, ProgressLabel, ProgressValue } from "@ajnacloud/ui";

export function ProgressFiles() {
  return (
    <Progress
      value={3}
      max={8}
      getAriaValueText={(_, value) => `${value} of 8 files uploaded`}
      style={{ maxWidth: 400 }}
    >
      <ProgressLabel>Project files</ProgressLabel>
      <ProgressValue>{(_, value) => `${value} / 8 files`}</ProgressValue>
    </Progress>
  );
}
