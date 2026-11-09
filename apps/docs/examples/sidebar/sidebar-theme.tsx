"use client";

import { Sidebar } from "@ajnacloud/ui";
import { Folder, Home } from "lucide-react";
import { type CSSProperties } from "react";

export function SidebarTheme() {
  return (
    <Sidebar.Provider
      contained
      mobileBreakpoint={0}
      className="h-[600px] overflow-hidden rounded-lg border border-[hsl(var(--ajna-border))] bg-[hsl(var(--ajna-background))]"
      style={
        {
          "--sidebar": "223 62.5% 18.8235%",
          "--sidebar-foreground": "210 47.619% 91.7647%",
          "--sidebar-accent": "223 50% 28%",
          "--sidebar-accent-foreground": "0 0% 100%",
          "--sidebar-border": "223 40% 35%",
          "--sidebar-ring": "27.7358 100% 58.4314%",
        } as CSSProperties
      }
    >
      <Sidebar>
        <Sidebar.Header>Custom workspace theme</Sidebar.Header>
        <Sidebar.Content>
          <Sidebar.Menu>
            <Sidebar.MenuButton icon={<Home />} tooltip="Overview" active>
              Overview
            </Sidebar.MenuButton>
            <Sidebar.MenuButton icon={<Folder />} tooltip="Projects">
              Projects
            </Sidebar.MenuButton>
          </Sidebar.Menu>
        </Sidebar.Content>
        <Sidebar.Footer>
          <Sidebar.Trigger />
        </Sidebar.Footer>
      </Sidebar>
      <main className="flex min-w-0 flex-1 items-center justify-center p-6 text-center text-[hsl(var(--ajna-muted-foreground))]">
        <p className="max-w-xs">
          Sidebar colors can change independently of the page theme.
        </p>
      </main>
    </Sidebar.Provider>
  );
}
