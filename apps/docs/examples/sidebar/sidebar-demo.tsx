"use client";

import { AjnaLogo, SearchInput, Sidebar } from "@ajnacloud/ui";
import { Folder, Home, Inbox, Settings } from "lucide-react";

export function SidebarDemo() {
  return (
    <Sidebar.Provider
      contained
      mobileBreakpoint={0}
      className="h-[600px] overflow-hidden rounded-lg border border-[hsl(var(--ajna-border))] bg-[hsl(var(--ajna-background))]"
    >
      <Sidebar aria-label="Workspace navigation">
        <Sidebar.Header>
          <AjnaLogo variant="glyph" className="size-6 shrink-0" />
          <span className="truncate px-2 font-semibold group-data-[state=collapsed]/sidebar:hidden">
            Ajna workspace
          </span>
        </Sidebar.Header>
        <Sidebar.Content>
          <div className="mb-3 group-data-[state=collapsed]/sidebar:hidden">
            <SearchInput
              aria-label="Search navigation"
              placeholder="Quick search..."
            />
          </div>
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
        </Sidebar.Footer>
        <Sidebar.Rail />
      </Sidebar>
      <main className="flex min-w-0 flex-1 items-center justify-center p-5 text-center text-[hsl(var(--ajna-muted-foreground))]">
        Main content area
      </main>
    </Sidebar.Provider>
  );
}
