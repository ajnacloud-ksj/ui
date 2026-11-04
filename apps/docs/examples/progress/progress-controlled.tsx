"use client";

import { Button, Progress, ProgressLabel, ProgressValue } from "@ajnacloud/ui";
import { useState } from "react";

export function ProgressControlled() {
  const [value, setValue] = useState(40);
  return (
    <div style={{ width: "100%", maxWidth: 400, display: "grid", gap: 16 }}>
      <Progress value={value}>
        <ProgressLabel>Uploading project</ProgressLabel>
        <ProgressValue />
      </Progress>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 12,
        }}
      >
        <Button
          variant="secondary"
          onClick={() => setValue(Math.max(0, value - 10))}
          disabled={value === 0}
        >
          Decrease
        </Button>
        <Button
          variant="secondary"
          onClick={() => setValue(Math.min(100, value + 10))}
          disabled={value === 100}
        >
          Increase
        </Button>
      </div>
    </div>
  );
}
