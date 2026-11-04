"use client";

import { Button, DropdownMenu } from "@ajnacloud/ui";

export function DropdownMenuLinks() {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger render={<Button variant="outline" />}>
        Documentation
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end">
        <DropdownMenu.Group>
          <DropdownMenu.Label>Learn Ajna</DropdownMenu.Label>
          <DropdownMenu.LinkItem href="/docs/installation">
            Installation
          </DropdownMenu.LinkItem>
          <DropdownMenu.LinkItem href="/docs/theming">
            Theming
          </DropdownMenu.LinkItem>
          <DropdownMenu.LinkItem
            href="https://github.com/mui/base-ui"
            target="_blank"
            rel="noreferrer"
          >
            Base UI source
          </DropdownMenu.LinkItem>
        </DropdownMenu.Group>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}
