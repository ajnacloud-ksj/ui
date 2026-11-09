"use client";

import { Button, Sidebar } from "@ajnacloud/ui";
import { Home, Inbox } from "lucide-react";
import { useState } from "react";

export function SidebarControlled() {
  const [open, setOpen] = useState(true);
  const [settled, setSettled] = useState("Ready");
  return (
    <div className="w-full space-y-3">
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
        className="h-[600px] overflow-hidden rounded-lg border border-[hsl(var(--ajna-border))] bg-[hsl(var(--ajna-background))]"
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
        <main className="flex min-w-0 flex-1 flex-col items-center justify-center gap-4 p-6 text-center [&>p]:max-w-sm">
          <p className="max-w-sm text-[hsl(var(--ajna-muted-foreground))]">
            The page owns the open state.
          </p>
        </main>
      </Sidebar.Provider>
    </div>
  );
}
