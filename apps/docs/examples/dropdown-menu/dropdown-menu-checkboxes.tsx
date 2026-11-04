"use client";

import { Button, DropdownMenu } from "@ajnacloud/ui";
import { useState } from "react";

export function DropdownMenuCheckboxes() {
  const [activity, setActivity] = useState(true);
  const [members, setMembers] = useState(false);
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger render={<Button variant="outline" />}>
        Visible sections
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Group>
          <DropdownMenu.Label inset>Show in sidebar</DropdownMenu.Label>
          <DropdownMenu.CheckboxItem
            checked={activity}
            onCheckedChange={setActivity}
          >
            Activity
          </DropdownMenu.CheckboxItem>
          <DropdownMenu.CheckboxItem
            checked={members}
            onCheckedChange={setMembers}
          >
            Members
          </DropdownMenu.CheckboxItem>
          <DropdownMenu.CheckboxItem disabled defaultChecked>
            Project overview
          </DropdownMenu.CheckboxItem>
        </DropdownMenu.Group>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}
