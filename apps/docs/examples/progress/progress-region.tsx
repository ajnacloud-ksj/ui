"use client";

import { Button, Progress, ProgressLabel, ProgressValue } from "@ajnacloud/ui";
import { useId, useState } from "react";

export function ProgressRegion() {
  const id = useId();
  const [complete, setComplete] = useState(false);
  return (
    <div style={{ width: "100%", maxWidth: 400, display: "grid", gap: 16 }}>
      <section
        aria-label="Imported projects"
        aria-busy={!complete}
        aria-describedby={id}
      >
        <Progress value={complete ? 100 : 60}>
          <ProgressLabel>Project import</ProgressLabel>
          <ProgressValue />
        </Progress>
        <p id={id}>
          {complete
            ? "Your projects are ready."
            : "Importing your projects. Keep this page open."}
        </p>
      </section>
      <Button variant="secondary" onClick={() => setComplete(!complete)}>
        {complete ? "Restart example" : "Finish example"}
      </Button>
      <span role="status">{complete ? "Import complete." : ""}</span>
    </div>
  );
}
