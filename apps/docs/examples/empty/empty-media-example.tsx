"use client";

import {
  Avatar,
  AvatarFallback,
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@ajnacloud/ui";

export function EmptyMediaExample() {
  return (
    <Empty style={{ border: "1px dashed hsl(var(--ajna-border))" }}>
      <EmptyHeader>
        <EmptyMedia aria-hidden="true">
          <Avatar size="lg">
            <AvatarFallback>AJ</AvatarFallback>
          </Avatar>
        </EmptyMedia>
        <EmptyTitle render={<h3>Your team starts here</h3>} />
        <EmptyDescription>
          Invite someone to work on your next project together.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <a href="mailto:teammate@example.com?subject=Join%20my%20team">
          Invite a teammate
        </a>
      </EmptyContent>
    </Empty>
  );
}
