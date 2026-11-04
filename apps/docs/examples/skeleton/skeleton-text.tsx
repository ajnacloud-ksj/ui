"use client";

import { Skeleton } from "@ajnacloud/ui";

export function SkeletonText() {
  return (
    <div style={{ display: "grid", gap: 8, width: "100%", maxWidth: 400 }}>
      <Skeleton style={{ width: "100%", height: 16 }} />
      <Skeleton style={{ width: "100%", height: 16 }} />
      <Skeleton style={{ width: "65%", height: 16 }} />
    </div>
  );
}
