"use client";

import { Card, CardContent, CardHeader, Skeleton } from "@ajnacloud/ui";

export function SkeletonCard() {
  return (
    <Card aria-hidden="true" style={{ width: "100%", maxWidth: 400 }}>
      <CardHeader>
        <Skeleton style={{ width: "55%", height: 24 }} />
        <Skeleton style={{ width: "85%", height: 16 }} />
      </CardHeader>
      <CardContent>
        <Skeleton style={{ width: "100%", height: 160 }} />
      </CardContent>
    </Card>
  );
}
