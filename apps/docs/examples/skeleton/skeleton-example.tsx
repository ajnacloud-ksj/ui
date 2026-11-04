"use client";

import { Skeleton } from "@ajnacloud/ui";

export function SkeletonExample() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <Skeleton style={{ width: 48, height: 48, borderRadius: "50%" }} />
      <div style={{ display: "grid", gap: 8 }}>
        <Skeleton style={{ width: 200, height: 16 }} />
        <Skeleton style={{ width: 150, height: 16 }} />
      </div>
    </div>
  );
}
