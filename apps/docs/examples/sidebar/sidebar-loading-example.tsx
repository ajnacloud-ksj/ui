"use client";

import { Button, Sidebar } from "@ajnacloud/ui";
import { Folder, Home } from "lucide-react";
import { useState } from "react";

export function SidebarLoadingExample() {
  const [loading, setLoading] = useState(true);
  return (
    <Sidebar.Provider
      contained
      mobileBreakpoint={0}
      className="h-[600px] overflow-hidden rounded-lg border border-[hsl(var(--ajna-border))] bg-[hsl(var(--ajna-background))]"
    >
      <Sidebar>
        <Sidebar.Header>
          <span className="truncate font-semibold">Workspace</span>
        </Sidebar.Header>
        {loading ? (
          <Sidebar.Loading label="Loading navigation" />
        ) : (
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
        )}
        <Sidebar.Footer>
          <Sidebar.Trigger />
        </Sidebar.Footer>
      </Sidebar>
      <main className="flex min-w-0 flex-1 flex-col items-center justify-center gap-4 p-6 text-center [&>p]:max-w-sm">
        <Button
          variant="secondary"
          onClick={() => setLoading((value) => !value)}
        >
          {loading ? "Show navigation" : "Show loading"}
        </Button>
      </main>
    </Sidebar.Provider>
  );
}
