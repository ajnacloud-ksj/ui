"use client";

import { Button, DropdownMenu } from "@ajnacloud/ui";
import { useState } from "react";

export function DropdownMenuControlled() {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <DropdownMenu.Root open={open} onOpenChange={setOpen}>
        <DropdownMenu.Trigger render={<Button variant="secondary" />}>
          Quick actions
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item
            closeOnClick={false}
            onClick={() => setCount(count + 1)}
          >
            Add a draft
          </DropdownMenu.Item>
          <DropdownMenu.Item onClick={() => setOpen(false)}>
            Done
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
      <p role="status" style={{ margin: 0 }}>
        Drafts added: {count}
      </p>
    </div>
  );
}
