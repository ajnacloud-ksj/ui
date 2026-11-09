"use client";

import { Sidebar, useSidebar } from "@ajnacloud/ui";
import { Folder, Home } from "lucide-react";

function SidebarWidth() {
  const { width, state } = useSidebar();
  return (
    <output className="text-sm" aria-live="polite">
      {state === "collapsed" ? "Collapsed" : `${width}px wide`}
    </output>
  );
}

export function SidebarResizable() {
  return (
    <Sidebar.Provider
      contained
      mobileBreakpoint={0}
      resizable
      defaultWidth={220}
      minWidth={180}
      maxWidth={360}
      className="h-[600px] overflow-hidden rounded-lg border border-[hsl(var(--ajna-border))] bg-[hsl(var(--ajna-background))]"
    >
      <Sidebar>
        <Sidebar.Header>
          <span className="truncate font-semibold">Resizable navigation</span>
        </Sidebar.Header>
        <Sidebar.Content>
          <Sidebar.Menu>
            <Sidebar.MenuButton icon={<Home />} tooltip="Home" active>
              Home
            </Sidebar.MenuButton>
            <Sidebar.MenuButton icon={<Folder />} tooltip="Projects">
              Projects
            </Sidebar.MenuButton>
          </Sidebar.Menu>
        </Sidebar.Content>
        <Sidebar.Footer>
          <Sidebar.Trigger />
        </Sidebar.Footer>
        <Sidebar.ResizeHandle />
      </Sidebar>
      <main className="flex min-w-0 flex-1 flex-col items-center justify-center gap-4 p-6 text-center [&>p]:max-w-sm">
        <SidebarWidth />
        <p className="text-sm">
          Drag the edge or focus the resize handle and use arrow keys, Home, or
          End.
        </p>
      </main>
    </Sidebar.Provider>
  );
}
