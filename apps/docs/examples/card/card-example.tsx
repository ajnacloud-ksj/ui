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
import { ArrowUpRight } from "lucide-react";

export function CardExample() {
  return (
    <Card style={{ width: "100%", maxWidth: 400 }}>
      <CardHeader>
        <CardTitle render={<h3>Starter plan</h3>} />
        <CardDescription>
          Everything you need for a personal project.
        </CardDescription>
        <CardAction>
          <Badge variant="secondary">Free</Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p style={{ margin: 0 }}>
          Three projects, shared previews, and community support.
        </p>
      </CardContent>
      <CardFooter>
        <a href="/docs/installation" className="inline-flex items-center gap-2">
          Get started <ArrowUpRight aria-hidden="true" size={14} />
        </a>
      </CardFooter>
    </Card>
  );
}
