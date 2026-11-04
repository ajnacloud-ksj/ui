"use client";

import { Button, Spinner } from "@ajnacloud/ui";
import { useState } from "react";

export function SpinnerLoading() {
  const [loading, setLoading] = useState(true);
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <section aria-label="Projects" aria-busy={loading}>
        {loading ? (
          <div
            role="status"
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 12,
            }}
          >
            <Spinner size="sm" aria-hidden="true" />
            Loading projects…
          </div>
        ) : (
          <p>Your projects are ready.</p>
        )}
      </section>
      <Button variant="secondary" onClick={() => setLoading(!loading)}>
        {loading ? "Show loaded content" : "Show loading state"}
      </Button>
    </div>
  );
}
