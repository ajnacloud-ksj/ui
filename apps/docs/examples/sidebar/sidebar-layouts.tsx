"use client";

import {
  Sidebar,
  type SidebarCollapsibleType,
  type SidebarSide,
  type SidebarVariant,
} from "@ajnacloud/ui";
import { Folder, Home } from "lucide-react";
import { useState } from "react";

export function SidebarLayouts() {
  const [variant, setVariant] = useState<SidebarVariant>("sidebar");
  const [side, setSide] = useState<SidebarSide>("left");
  const [collapsible, setCollapsible] =
    useState<SidebarCollapsibleType>("icon");
  const panel = (
    <Sidebar aria-label="Layout navigation">
      <Sidebar.Header>
        <span className="truncate font-semibold">Workspace</span>
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
    </Sidebar>
  );
  const main = (
    <main
      className={
        variant === "inset"
          ? "m-2 min-w-0 flex-1 rounded-lg border bg-[hsl(var(--ajna-background))] p-5"
          : "min-w-0 flex-1 p-5"
      }
    >
      <Sidebar.Trigger />
      <p>Application content</p>
    </main>
  );
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 text-sm">
        <label className="flex items-center gap-2">
          Layout
          <select
            className="rounded border bg-[hsl(var(--ajna-background))] p-1"
            value={variant}
            onChange={(e) => setVariant(e.target.value as SidebarVariant)}
          >
            <option value="sidebar">Sidebar</option>
            <option value="floating">Floating</option>
            <option value="inset">Inset</option>
          </select>
        </label>
        <label className="flex items-center gap-2">
          Side
          <select
            className="rounded border bg-[hsl(var(--ajna-background))] p-1"
            value={side}
            onChange={(e) => setSide(e.target.value as SidebarSide)}
          >
            <option value="left">Left</option>
            <option value="right">Right</option>
          </select>
        </label>
        <label className="flex items-center gap-2">
          Collapse
          <select
            className="rounded border bg-[hsl(var(--ajna-background))] p-1"
            value={collapsible}
            onChange={(e) =>
              setCollapsible(e.target.value as SidebarCollapsibleType)
            }
          >
            <option value="icon">Icons</option>
            <option value="offcanvas">Offcanvas</option>
            <option value="none">Fixed</option>
          </select>
        </label>
      </div>
      <Sidebar.Provider
        contained
        mobileBreakpoint={0}
        variant={variant}
        side={side}
        collapsible={collapsible}
        className="h-72"
      >
        {side === "right" && main}
        {panel}
        {side === "left" && main}
      </Sidebar.Provider>
    </div>
  );
}
