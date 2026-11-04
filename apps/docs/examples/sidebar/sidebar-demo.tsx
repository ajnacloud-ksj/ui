"use client";

import { AjnaLogo, Sidebar } from "@ajnacloud/ui";
import { Folder, Home, Inbox, Settings } from "lucide-react";

export function SidebarDemo() {
  return (
    <Sidebar.Provider contained mobileBreakpoint={0} className="h-[420px]">
      <Sidebar aria-label="Workspace navigation">
        <Sidebar.Header>
          <AjnaLogo variant="glyph" className="size-6 shrink-0" />
          <span className="truncate px-2 font-semibold group-data-[state=collapsed]/sidebar:hidden">
            Ajna workspace
          </span>
        </Sidebar.Header>
        <Sidebar.Content>
          <Sidebar.Group>
            <Sidebar.GroupLabel>Workspace</Sidebar.GroupLabel>
            <Sidebar.Menu>
              <Sidebar.MenuButton
                icon={<Home />}
                tooltip="Overview"
                href="#overview"
                active
              >
                Overview
              </Sidebar.MenuButton>
              <Sidebar.MenuButton
                icon={<Inbox />}
                tooltip="Inbox"
                href="#inbox"
              >
                Inbox<Sidebar.MenuBadge>12</Sidebar.MenuBadge>
              </Sidebar.MenuButton>
              <Sidebar.MenuItem>
                <Sidebar.Collapsible defaultOpen>
                  <Sidebar.CollapsibleTrigger
                    render={
                      <Sidebar.MenuButton icon={<Folder />} tooltip="Projects">
                        Projects
                        <Sidebar.MenuChevron />
                      </Sidebar.MenuButton>
                    }
                  />
                  <Sidebar.CollapsibleContent>
                    <Sidebar.MenuSub>
                      <Sidebar.MenuSubButton href="#active">
                        Active projects
                      </Sidebar.MenuSubButton>
                      <Sidebar.MenuSubButton href="#archived">
                        Archived projects
                      </Sidebar.MenuSubButton>
                    </Sidebar.MenuSub>
                  </Sidebar.CollapsibleContent>
                </Sidebar.Collapsible>
              </Sidebar.MenuItem>
            </Sidebar.Menu>
          </Sidebar.Group>
          <Sidebar.Separator />
          <Sidebar.Group>
            <Sidebar.GroupLabel>Manage</Sidebar.GroupLabel>
            <Sidebar.Menu>
              <Sidebar.MenuButton
                icon={<Settings />}
                tooltip="Settings"
                href="#settings"
              >
                Settings
              </Sidebar.MenuButton>
            </Sidebar.Menu>
          </Sidebar.Group>
        </Sidebar.Content>
        <Sidebar.Footer>
          <Sidebar.Trigger />
          <span className="truncate text-xs group-data-[state=collapsed]/sidebar:hidden">
            Workspace settings
          </span>
        </Sidebar.Footer>
        <Sidebar.Rail />
      </Sidebar>
      <main className="min-w-0 flex-1 p-5">
        <h3 className="m-0 font-semibold">Overview</h3>
        <p className="text-sm text-[hsl(var(--ajna-muted-foreground))]">
          Collapse the sidebar or open the Projects section.
        </p>
      </main>
    </Sidebar.Provider>
  );
}
