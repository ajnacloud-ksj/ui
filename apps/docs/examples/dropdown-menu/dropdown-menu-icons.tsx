"use client";

import { Button, DropdownMenu } from "@ajnacloud/ui";
import { Copy, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

export function DropdownMenuIcons() {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        render={
          <Button
            variant="secondary"
            shape="square"
            aria-label="Project actions"
            icon={<MoreHorizontal />}
          />
        }
      />
      <DropdownMenu.Content>
        <DropdownMenu.Item>
          <Pencil aria-hidden="true" />
          Rename<DropdownMenu.Shortcut>⌘R</DropdownMenu.Shortcut>
        </DropdownMenu.Item>
        <DropdownMenu.Item>
          <Copy aria-hidden="true" />
          Duplicate<DropdownMenu.Shortcut>⌘D</DropdownMenu.Shortcut>
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item variant="destructive">
          <Trash2 aria-hidden="true" />
          Delete
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}
