"use client";

import { Button, Sidebar } from "@ajnacloud/ui";
import { Home, Inbox } from "lucide-react";
import { useState } from "react";

export function SidebarControlled() {
  const [open, setOpen] = useState(true);
  const [settled, setSettled] = useState("Ready");
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="secondary" onClick={() => setOpen((value) => !value)}>
          {open ? "Collapse" : "Expand"} navigation
        </Button>
        <output className="text-sm" aria-live="polite">
          {settled}
        </output>
      </div>
      <Sidebar.Provider
        contained
        mobileBreakpoint={0}
        open={open}
        onOpenChange={setOpen}
        onOpenChangeComplete={(value) =>
          setSettled(value ? "Navigation expanded" : "Navigation collapsed")
        }
        className="h-60"
      >
        <Sidebar>
          <Sidebar.Content>
            <Sidebar.Menu>
              <Sidebar.MenuButton icon={<Home />} tooltip="Home" active>
                Home
              </Sidebar.MenuButton>
              <Sidebar.MenuButton icon={<Inbox />} tooltip="Inbox">
                Inbox
              </Sidebar.MenuButton>
            </Sidebar.Menu>
          </Sidebar.Content>
          <Sidebar.Footer>
            <Sidebar.Trigger />
          </Sidebar.Footer>
        </Sidebar>
        <main className="min-w-0 flex-1 p-5">
          The page owns the open state.
        </main>
      </Sidebar.Provider>
    </div>
  );
}
