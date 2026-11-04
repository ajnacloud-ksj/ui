"use client";

import { Button, Popover } from "@ajnacloud/ui";

export function PopoverExample() {
  return (
    <Popover.Root>
      <Popover.Trigger render={<Button variant="outline" />}>
        Share project
      </Popover.Trigger>
      <Popover.Content>
        <Popover.Header>
          <Popover.Title>Share this project</Popover.Title>
          <Popover.Description>
            Anyone with the link can view the project.
          </Popover.Description>
        </Popover.Header>
        <Popover.Close render={<Button variant="secondary" />}>
          Done
        </Popover.Close>
      </Popover.Content>
    </Popover.Root>
  );
}
