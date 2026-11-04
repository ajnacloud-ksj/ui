"use client";

import { AjnaLogo, Sidebar, useSidebar } from "@ajnacloud/ui";
import { type ReactElement, type ReactNode, useId } from "react";

export interface AppNavigationItem {
  label: string;
  href: string;
  icon?: ReactElement;
  active?: boolean;
}

export interface AppShellProps {
  name: string;
  logo?: ReactNode;
  subtitle?: string;
  navigation: readonly AppNavigationItem[];
  secondaryNavigation?: readonly AppNavigationItem[];
  account?: ReactNode;
  header?: ReactNode;
  children: ReactNode;
  onNavigate?: (item: AppNavigationItem) => void;
}

function Navigation({
  items,
  onNavigate,
}: {
  items: readonly AppNavigationItem[];
  onNavigate?: AppShellProps["onNavigate"];
}) {
  const { setOpenMobile } = useSidebar();
  return (
    <Sidebar.Menu>
      {items.map((item) => (
        <Sidebar.MenuButton
          key={item.href}
          href={item.href}
          icon={item.icon}
          active={item.active}
          tooltip={item.label}
          onClick={(event) => {
            if (
              event.metaKey ||
              event.ctrlKey ||
              event.shiftKey ||
              event.altKey
            )
              return;
            if (onNavigate) {
              event.preventDefault();
              onNavigate(item);
            }
            setOpenMobile(false);
          }}
        >
          {item.label}
        </Sidebar.MenuButton>
      ))}
    </Sidebar.Menu>
  );
}

export function AppShell({
  name,
  logo,
  subtitle,
  navigation,
  secondaryNavigation,
  account,
  header,
  children,
  onNavigate,
}: AppShellProps) {
  const id = useId();
  return (
    <Sidebar.Provider
      contained
      className="h-dvh overflow-hidden bg-ajna-background text-ajna-foreground"
      collapsible="icon"
    >
      <a
        href={`#${id}`}
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-ajna-primary focus:px-4 focus:py-2 focus:text-ajna-primary-foreground"
      >
        Skip to content
      </a>
      <Sidebar aria-label={`${name} navigation`}>
        <Sidebar.Header>
          {logo ?? (
            <AjnaLogo
              variant="glyph"
              color="current"
              width={28}
              className="shrink-0"
            />
          )}
          <div className="min-w-0 px-2 group-data-[state=collapsed]/sidebar:hidden">
            <div className="truncate text-sm font-semibold">{name}</div>
            {subtitle && (
              <div className="truncate text-xs text-ajna-sidebar-foreground/60">
                {subtitle}
              </div>
            )}
          </div>
        </Sidebar.Header>
        <Sidebar.Content>
          <Sidebar.Group>
            <Sidebar.GroupLabel>Workspace</Sidebar.GroupLabel>
            <Navigation items={navigation} onNavigate={onNavigate} />
          </Sidebar.Group>
          {secondaryNavigation && (
            <Sidebar.Group>
              <Sidebar.GroupLabel>Manage</Sidebar.GroupLabel>
              <Navigation items={secondaryNavigation} onNavigate={onNavigate} />
            </Sidebar.Group>
          )}
        </Sidebar.Content>
        {account && <Sidebar.Footer>{account}</Sidebar.Footer>}
        <Sidebar.Rail />
      </Sidebar>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex h-[var(--ajna-sidebar-header-height)] shrink-0 items-center gap-4 border-b border-ajna-border px-4 sm:px-6">
          <Sidebar.Trigger />
          <div className="h-4 w-px bg-ajna-border" aria-hidden="true" />
          <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
            {header ?? (
              <span className="truncate text-sm font-medium">{name}</span>
            )}
          </div>
        </header>
        <main
          id={id}
          tabIndex={-1}
          className="min-h-0 min-w-0 flex-1 overflow-auto outline-none"
        >
          {children}
        </main>
      </div>
    </Sidebar.Provider>
  );
}
