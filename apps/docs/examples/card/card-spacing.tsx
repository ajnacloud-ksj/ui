"use client";

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@ajnacloud/ui";
import { type CSSProperties, useState } from "react";

export function CardSpacing() {
  const [spacing, setSpacing] = useState(16);
  return (
    <div className="grid w-full max-w-md gap-4">
      <div className="flex flex-wrap gap-2">
        {[16, 20, 24, 32].map((value) => (
          <Button
            key={value}
            size="sm"
            variant={value === spacing ? "primary" : "outline"}
            onClick={() => setSpacing(value)}
            aria-pressed={value === spacing}
          >
            {value}px
          </Button>
        ))}
      </div>
      <Card style={{ "--ajna-card-spacing": `${spacing}px` } as CSSProperties}>
        <CardHeader>
          <CardTitle>Project overview</CardTitle>
          <CardDescription>Shared spacing across each section.</CardDescription>
        </CardHeader>
        <CardContent>Manage your projects and workspace settings.</CardContent>
        <CardFooter>
          <Button variant="primary">Open workspace</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
