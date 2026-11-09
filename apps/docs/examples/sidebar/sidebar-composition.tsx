"use client";

import { Button, DropdownMenu, SearchInput, Sidebar } from "@ajnacloud/ui";
import {
  ChevronDown,
  Folder,
  Home,
  MoreHorizontal,
  Plus,
  Settings,
} from "lucide-react";

export function SidebarComposition() {
  return (
    <Sidebar.Provider
      contained
      mobileBreakpoint={0}
      className="h-[600px] overflow-hidden rounded-lg border border-[hsl(var(--ajna-border))] bg-[hsl(var(--ajna-background))]"
    >
      <Sidebar>
        <Sidebar.Header>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger
              render={
                <Button
                  variant="ghost"
                  size="sm"
                  className="min-w-0 flex-1 justify-between"
                />
              }
            >
              Ajna workspace
              <ChevronDown aria-hidden="true" className="size-4" />
            </DropdownMenu.Trigger>
            <DropdownMenu.Content align="start">
              <DropdownMenu.Item>Personal workspace</DropdownMenu.Item>
              <DropdownMenu.Item>Engineering workspace</DropdownMenu.Item>
              <DropdownMenu.Separator />
              <DropdownMenu.Item>
                <Plus aria-hidden="true" />
                Create workspace
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </Sidebar.Header>
        <Sidebar.Content>
          <div className="mb-3 group-data-[state=collapsed]/sidebar:hidden">
            <SearchInput
              aria-label="Search navigation"
              placeholder="Search navigation"
            />
          </div>
          <Sidebar.Menu>
            <Sidebar.MenuButton icon={<Home />} tooltip="Overview" active>
              Overview
            </Sidebar.MenuButton>
            <Sidebar.MenuButton size="sm" icon={<Folder />} tooltip="Projects">
              Projects<Sidebar.MenuBadge>Beta</Sidebar.MenuBadge>
            </Sidebar.MenuButton>
            <Sidebar.MenuButton
              icon={<Settings />}
              tooltip="Administration"
              disabled
            >
              Administration
            </Sidebar.MenuButton>
          </Sidebar.Menu>
        </Sidebar.Content>
        <Sidebar.Footer>
          <Sidebar.Trigger />
          <DropdownMenu.Root>
            <DropdownMenu.Trigger
              render={
                <Button
                  variant="ghost"
                  shape="square"
                  size="sm"
                  aria-label="Workspace actions"
                />
              }
            >
              <MoreHorizontal aria-hidden="true" className="size-4" />
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              <DropdownMenu.Item>Invite members</DropdownMenu.Item>
              <DropdownMenu.Item>Manage workspace</DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </Sidebar.Footer>
      </Sidebar>
      <main className="flex min-w-0 flex-1 flex-col items-center justify-center gap-4 p-6 text-center [&>p]:max-w-sm">
        <p className="max-w-sm text-[hsl(var(--ajna-muted-foreground))]">
          Compose menus and search controls using the existing components.
        </p>
      </main>
    </Sidebar.Provider>
  );
}
