"use client";

import { Button, Sidebar } from "@ajnacloud/ui";
import { ArrowLeft, Folder, Home, Inbox, Settings } from "lucide-react";
import { useState } from "react";

export function SidebarSliding() {
  const [view, setView] = useState("account");
  return (
    <Sidebar.Provider
      contained
      mobileBreakpoint={0}
      className="h-[600px] overflow-hidden rounded-lg border border-[hsl(var(--ajna-border))] bg-[hsl(var(--ajna-background))]"
    >
      <Sidebar>
        <Sidebar.Header>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setView(view === "account" ? "project" : "account")}
            icon={view === "project" ? <ArrowLeft /> : <Folder />}
          >
            {view === "account" ? "Open project" : "Back to account"}
          </Button>
        </Sidebar.Header>
        <Sidebar.SlidingViews activeKey={view}>
          <Sidebar.SlidingView value="account">
            <Sidebar.Content>
              <Sidebar.Group>
                <Sidebar.GroupLabel>Account</Sidebar.GroupLabel>
                <Sidebar.Menu>
                  <Sidebar.MenuButton icon={<Home />} active>
                    Overview
                  </Sidebar.MenuButton>
                  <Sidebar.MenuButton icon={<Inbox />}>
                    Inbox
                  </Sidebar.MenuButton>
                </Sidebar.Menu>
              </Sidebar.Group>
            </Sidebar.Content>
          </Sidebar.SlidingView>
          <Sidebar.SlidingView value="project">
            <Sidebar.Content>
              <Sidebar.Group>
                <Sidebar.GroupLabel>Project</Sidebar.GroupLabel>
                <Sidebar.Menu>
                  <Sidebar.MenuButton icon={<Folder />} active>
                    Files
                  </Sidebar.MenuButton>
                  <Sidebar.MenuButton icon={<Settings />}>
                    Project settings
                  </Sidebar.MenuButton>
                </Sidebar.Menu>
              </Sidebar.Group>
            </Sidebar.Content>
          </Sidebar.SlidingView>
        </Sidebar.SlidingViews>
        <Sidebar.Footer>
          <Sidebar.Trigger />
        </Sidebar.Footer>
      </Sidebar>
      <main className="flex min-w-0 flex-1 flex-col items-center justify-center gap-4 p-6 text-center [&>p]:max-w-sm">
        <p className="max-w-sm text-[hsl(var(--ajna-muted-foreground))]">
          Switch navigation surfaces from the header. Inactive views retain
          their state and cannot receive focus.
        </p>
      </main>
    </Sidebar.Provider>
  );
}
