"use client";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@ajnacloud/ui";

export function EmptyText() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyTitle render={<h3>No notifications</h3>} />
        <EmptyDescription>New notifications will appear here.</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
