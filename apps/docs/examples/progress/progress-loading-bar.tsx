"use client";

import { Button, Progress } from "@ajnacloud/ui";
import { useState } from "react";

export function ProgressLoadingBar() {
  const [loading, setLoading] = useState(true);
  return (
    <div className="relative w-full max-w-md rounded-lg border border-fd-border">
      <div className="h-0.5 overflow-hidden rounded-t-lg">
        {loading && (
          <Progress
            value={null}
            aria-label="Refreshing records"
            trackClassName="h-0.5 rounded-none bg-transparent"
          />
        )}
      </div>
      <div
        className="flex items-center justify-between gap-4 p-4"
        aria-busy={loading}
      >
        <span>Records</span>
        <Button variant="secondary" onClick={() => setLoading(!loading)}>
          {loading ? "Stop loading" : "Start loading"}
        </Button>
      </div>
    </div>
  );
}
