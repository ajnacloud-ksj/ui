"use client";

import { Button, Progress, ProgressLabel, ProgressValue } from "@ajnacloud/ui";
import { useState } from "react";

export function ProgressIndeterminate() {
  const [known, setKnown] = useState(false);
  return (
    <div style={{ width: "100%", maxWidth: 400, display: "grid", gap: 16 }}>
      <Progress
        value={known ? 2 : null}
        max={8}
        aria-valuetext={
          known ? "2 of 8 files imported" : "Finding files to import"
        }
      >
        <ProgressLabel>Importing files</ProgressLabel>
        <ProgressValue>
          {(_, value) =>
            value === null ? "Finding files…" : `${value} / 8 files`
          }
        </ProgressValue>
      </Progress>
      <Button variant="secondary" onClick={() => setKnown(!known)}>
        {known ? "Use unknown total" : "Use known total"}
      </Button>
    </div>
  );
}
