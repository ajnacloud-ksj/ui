"use client";

import { Button, Skeleton } from "@ajnacloud/ui";
import { useState } from "react";

export function SkeletonLoading() {
  const [loading, setLoading] = useState(true);
  return (
    <div style={{ display: "grid", gap: 16, width: "100%", maxWidth: 400 }}>
      <section
        aria-label="Profile"
        aria-busy={loading}
        style={{ minHeight: 64 }}
      >
        {loading ? (
          <>
            <span role="status">Loading profile…</span>
            <Skeleton style={{ width: "75%", height: 20, marginTop: 8 }} />
          </>
        ) : (
          <p style={{ margin: 0 }}>Your profile is ready.</p>
        )}
      </section>
      <Button variant="secondary" onClick={() => setLoading(!loading)}>
        {loading ? "Show loaded content" : "Show loading state"}
      </Button>
    </div>
  );
}
