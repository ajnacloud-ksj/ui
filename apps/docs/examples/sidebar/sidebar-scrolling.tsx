"use client";

import { Button, Sidebar, useSidebar } from "@ajnacloud/ui";
import { Folder } from "lucide-react";

function JumpToItem() {
  const { scrollToItem } = useSidebar();
  return (
    <Button
      variant="secondary"
      onClick={() =>
        scrollToItem("project-30", { align: "center", behavior: "smooth" })
      }
    >
      Jump to project 30
    </Button>
  );
}

export function SidebarScrolling() {
  return (
    <Sidebar.Provider
      contained
      mobileBreakpoint={0}
      className="h-[600px] overflow-hidden rounded-lg border border-[hsl(var(--ajna-border))] bg-[hsl(var(--ajna-background))]"
    >
      <Sidebar>
        <Sidebar.Header>Projects</Sidebar.Header>
        <Sidebar.Content>
          <Sidebar.Menu>
            {Array.from({ length: 30 }, (_, index) => (
              <Sidebar.MenuButton
                key={index}
                itemId={`project-${index + 1}`}
                icon={<Folder />}
                tooltip={`Project ${index + 1}`}
              >
                Project {index + 1}
              </Sidebar.MenuButton>
            ))}
          </Sidebar.Menu>
        </Sidebar.Content>
        <Sidebar.Footer>
          <Sidebar.Trigger />
        </Sidebar.Footer>
      </Sidebar>
      <main className="flex min-w-0 flex-1 flex-col items-center justify-center gap-4 p-6 text-center [&>p]:max-w-sm">
        <JumpToItem />
      </main>
    </Sidebar.Provider>
  );
}
