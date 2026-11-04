"use client";

import {
  Badge,
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@ajnacloud/ui";

export function CardCompact() {
  return (
    <Card size="sm" style={{ width: "100%", maxWidth: 360 }}>
      <CardHeader>
        <CardTitle render={<h3>Storage</h3>} />
        <CardDescription>Your current workspace usage.</CardDescription>
        <CardAction>
          <Badge variant="outline">Pro</Badge>
        </CardAction>
      </CardHeader>
      <CardContent>2.4 GB of 10 GB used</CardContent>
      <CardFooter>
        <a href="/docs/components/progress">View usage details</a>
      </CardFooter>
    </Card>
  );
}
