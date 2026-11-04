"use client";

import { Button, DropdownMenu } from "@ajnacloud/ui";
import { useState } from "react";

export function DropdownMenuSubmenu() {
  const [action, setAction] = useState("Choose a sharing action.");
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger render={<Button variant="secondary" />}>
          Share project
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item
            onClick={() => setAction("Project link requested.")}
          >
            Copy link
          </DropdownMenu.Item>
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger>Invite teammates</DropdownMenu.SubTrigger>
            <DropdownMenu.SubContent>
              <DropdownMenu.Item
                onClick={() => setAction("Email invitation requested.")}
              >
                By email
              </DropdownMenu.Item>
              <DropdownMenu.Item
                onClick={() => setAction("Invitation link requested.")}
              >
                With an invite link
              </DropdownMenu.Item>
            </DropdownMenu.SubContent>
          </DropdownMenu.Sub>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
      <p role="status" style={{ margin: 0 }}>
        {action}
      </p>
    </div>
  );
}
