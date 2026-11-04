"use client";

import { Sidebar } from "@ajnacloud/ui";
import { Folder, Home } from "lucide-react";
import { useState } from "react";

export function SidebarMobile() {
  const [fullScreen, setFullScreen] = useState(false);
  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={fullScreen}
          onChange={(event) => setFullScreen(event.target.checked)}
        />
        Full-width navigation
      </label>
      <Sidebar.Provider contained mobileBreakpoint={9999} className="h-80">
        <Sidebar fullScreenOnMobile={fullScreen} aria-label="Mobile workspace">
          <Sidebar.Header>
            <span className="min-w-0 flex-1 truncate font-semibold">
              Workspace
            </span>
            <Sidebar.Close />
          </Sidebar.Header>
          <Sidebar.Content>
            <Sidebar.Menu>
              <Sidebar.MenuButton icon={<Home />} href="#overview" active>
                Overview
              </Sidebar.MenuButton>
              <Sidebar.MenuButton icon={<Folder />} href="#projects">
                Projects
              </Sidebar.MenuButton>
            </Sidebar.Menu>
          </Sidebar.Content>
        </Sidebar>
        <main className="min-w-0 flex-1 p-5">
          <Sidebar.Trigger />
          <p className="text-sm">
            Open navigation, then swipe left on a touchscreen to close it.
            Escape, the backdrop, and the close button also dismiss it.
          </p>
        </main>
      </Sidebar.Provider>
    </div>
  );
}
