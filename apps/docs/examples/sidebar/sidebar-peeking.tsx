"use client";

import { Sidebar } from "@ajnacloud/ui";
import { Folder, Home, Inbox } from "lucide-react";

export function SidebarPeeking() {
  return (
    <Sidebar.Provider
      contained
      mobileBreakpoint={0}
      defaultOpen={false}
      peekable
      className="h-72"
    >
      <Sidebar>
        <Sidebar.Header>
          <Folder aria-hidden="true" className="size-5 shrink-0" />
          <span className="truncate pl-3">Workspace</span>
        </Sidebar.Header>
        <Sidebar.Content>
          <Sidebar.Menu>
            <Sidebar.MenuButton icon={<Home />} tooltip="Overview" active>
              Overview
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
        Hover or focus the icon rail. The content expands over this page without
        moving it. The footer does not trigger expansion.
      </main>
    </Sidebar.Provider>
  );
}
