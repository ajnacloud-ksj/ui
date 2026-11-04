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
    <Sidebar.Provider contained mobileBreakpoint={0} className="h-80">
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
      <main className="min-w-0 flex-1 p-5">
        <JumpToItem />
      </main>
    </Sidebar.Provider>
  );
}
