"use client";

import { Button, DropdownMenu } from "@ajnacloud/ui";
import { useState } from "react";

export function DropdownMenuExample() {
  const [action, setAction] = useState("Choose an action.");
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger render={<Button variant="outline" />}>
          Project actions
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Group>
            <DropdownMenu.Label>Website refresh</DropdownMenu.Label>
            <DropdownMenu.Item onClick={() => setAction("Rename requested.")}>
              Rename
            </DropdownMenu.Item>
            <DropdownMenu.Item
              onClick={() => setAction("Duplicate requested.")}
            >
              Duplicate
            </DropdownMenu.Item>
            <DropdownMenu.Item disabled>Archive</DropdownMenu.Item>
          </DropdownMenu.Group>
          <DropdownMenu.Separator />
          <DropdownMenu.Item
            variant="destructive"
            onClick={() => setAction("Deletion requested.")}
          >
            Delete project
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
      <p role="status" style={{ margin: 0 }}>
        {action}
      </p>
    </div>
  );
}
