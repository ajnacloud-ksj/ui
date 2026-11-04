"use client";

import { Menubar } from "@ajnacloud/ui";
import { useState } from "react";

export function MenubarBasic() {
  const [message, setMessage] = useState("Choose a command.");
  return (
    <div className="space-y-3">
      <Menubar aria-label="Document editor">
        <Menubar.Menu>
          <Menubar.Trigger>File</Menubar.Trigger>
          <Menubar.Content>
            <Menubar.Item onClick={() => setMessage("New document created.")}>
              New document<Menubar.Shortcut>⌘N</Menubar.Shortcut>
            </Menubar.Item>
            <Menubar.Item onClick={() => setMessage("Document saved.")}>
              Save<Menubar.Shortcut>⌘S</Menubar.Shortcut>
            </Menubar.Item>
            <Menubar.Separator />
            <Menubar.Sub>
              <Menubar.SubTrigger>Share</Menubar.SubTrigger>
              <Menubar.SubContent>
                <Menubar.Item onClick={() => setMessage("Invitation ready.")}>
                  Invite people
                </Menubar.Item>
                <Menubar.Item onClick={() => setMessage("Link ready to copy.")}>
                  Get link
                </Menubar.Item>
              </Menubar.SubContent>
            </Menubar.Sub>
            <Menubar.Separator />
            <Menubar.Item disabled>Print</Menubar.Item>
            <Menubar.Item
              variant="destructive"
              onClick={() => setMessage("Document moved to trash.")}
            >
              Move to trash
            </Menubar.Item>
          </Menubar.Content>
        </Menubar.Menu>
        <Menubar.Menu>
          <Menubar.Trigger>Edit</Menubar.Trigger>
          <Menubar.Content>
            <Menubar.Item onClick={() => setMessage("Last change undone.")}>
              Undo<Menubar.Shortcut>⌘Z</Menubar.Shortcut>
            </Menubar.Item>
            <Menubar.Item disabled>Redo</Menubar.Item>
          </Menubar.Content>
        </Menubar.Menu>
        <Menubar.Menu>
          <Menubar.Trigger>Help</Menubar.Trigger>
          <Menubar.Content>
            <Menubar.LinkItem href="/docs">Documentation</Menubar.LinkItem>
          </Menubar.Content>
        </Menubar.Menu>
      </Menubar>
      <p
        role="status"
        className="text-sm text-[hsl(var(--ajna-muted-foreground))]"
      >
        {message}
      </p>
    </div>
  );
}
