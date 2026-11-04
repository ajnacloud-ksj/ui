"use client";

import { AjnaLogo } from "@ajnacloud/ui";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "fumadocs-ui/components/ui/popover";
import { SidebarTrigger } from "fumadocs-ui/layouts/notebook/slots/sidebar";
import {
  FullSearchTrigger,
  SearchTrigger,
} from "fumadocs-ui/layouts/shared/slots/search-trigger";
import { ThemeSwitch } from "fumadocs-ui/layouts/shared/slots/theme-switch";
import { Menu, PanelLeft } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ComponentProps, type ReactNode, useState } from "react";

import { siteLinks } from "@/lib/layout.shared";

const iconButtonClass =
  "inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-fd-muted-foreground outline-none hover:bg-fd-accent hover:text-fd-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fd-ring";

export function SiteHeader({
  sidebarTrigger,
  className = "",
  ...props
}: ComponentProps<"header"> & { sidebarTrigger?: ReactNode }) {
  const pathname = usePathname();
  const active = siteLinks.find(
    (link) =>
      pathname === link.prefix || pathname.startsWith(`${link.prefix}/`),
  );
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      id="nd-nav"
      {...props}
      className={`sticky top-0 z-40 h-16 border-b border-fd-border bg-fd-background/95 backdrop-blur-sm ${className}`}
    >
      <nav
        aria-label="Main navigation"
        className="flex h-full w-full items-center gap-2 px-4 sm:gap-8 sm:px-6"
      >
        {sidebarTrigger}
        <Link
          href="/"
          aria-label="Ajna home"
          className="shrink-0 rounded-sm outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-fd-ring"
        >
          <AjnaLogo color="current" width={96} className="w-20 sm:w-24" />
        </Link>
        <div className="hidden h-full items-center gap-6 md:flex">
          {siteLinks.map((link) => (
            <Link
              key={link.url}
              href={link.url}
              aria-current={active === link ? "page" : undefined}
              className="inline-flex h-full items-center border-b-2 border-transparent pt-0.5 text-sm text-fd-muted-foreground outline-none hover:text-fd-foreground focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-fd-ring aria-[current=page]:border-fd-primary aria-[current=page]:text-fd-foreground"
            >
              {link.text}
            </Link>
          ))}
        </div>
        <div className="ms-auto flex shrink-0 items-center gap-2 sm:gap-3">
          <FullSearchTrigger
            hideIfDisabled
            className="hidden h-10 w-56 bg-fd-background px-3 lg:inline-flex"
          />
          <SearchTrigger hideIfDisabled className="size-9 lg:hidden" />
          <ThemeSwitch />
          <Popover open={menuOpen} onOpenChange={setMenuOpen}>
            <PopoverTrigger
              aria-label="Open navigation menu"
              className={`${iconButtonClass} md:hidden`}
            >
              <Menu aria-hidden="true" className="size-5" />
            </PopoverTrigger>
            <PopoverContent align="end" className="flex w-48 flex-col p-1.5">
              {siteLinks.map((link) => (
                <Link
                  key={link.url}
                  href={link.url}
                  aria-current={active === link ? "page" : undefined}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-md px-3 py-2 text-sm text-fd-muted-foreground outline-none hover:bg-fd-accent hover:text-fd-foreground focus-visible:bg-fd-accent focus-visible:text-fd-foreground aria-[current=page]:bg-fd-accent aria-[current=page]:text-fd-accent-foreground"
                >
                  {link.text}
                </Link>
              ))}
            </PopoverContent>
          </Popover>
        </div>
      </nav>
    </header>
  );
}

export function DocsHeader(props: ComponentProps<"header">) {
  return (
    <SiteHeader
      {...props}
      id="nd-subnav"
      className="[grid-area:header] layout:[--fd-header-height:--spacing(16)]"
      sidebarTrigger={
        <SidebarTrigger
          aria-label="Open documentation sidebar"
          className={`${iconButtonClass} md:hidden`}
        >
          <PanelLeft aria-hidden="true" className="size-5" />
        </SidebarTrigger>
      }
    />
  );
}
