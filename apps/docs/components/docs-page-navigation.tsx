"use client";

import type { FooterProps } from "fumadocs-ui/layouts/notebook/page";
import { useFooterItems } from "fumadocs-ui/utils/use-footer-items";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const linkClassName =
  "flex min-h-22 min-w-0 items-center gap-4 rounded-2xl border border-fd-border px-5 py-4 text-fd-foreground outline-none transition-colors hover:bg-fd-muted focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-fd-ring motion-reduce:transition-none";

export function DocsPageNavigation({
  items,
  children,
  className,
  ...props
}: FooterProps) {
  const pages = useFooterItems();
  const pathname = usePathname();
  const index = pages.findIndex(
    (page) => page.url.replace(/\/$/, "") === pathname.replace(/\/$/, ""),
  );
  const { previous, next } =
    items ??
    (index < 0 ? {} : { previous: pages[index - 1], next: pages[index + 1] });

  return (
    <div {...props} className={className}>
      {(previous || next) && (
        <nav
          aria-label="Page navigation"
          className="grid grid-cols-1 gap-3 sm:grid-cols-2"
        >
          {previous && (
            <Link href={previous.url} rel="prev" className={linkClassName}>
              <ChevronLeft
                aria-hidden="true"
                className="size-4 shrink-0 text-fd-muted-foreground rtl:rotate-180"
              />
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="text-sm leading-5 text-fd-muted-foreground">
                  Previous
                </span>
                <span className="text-base leading-6 font-medium wrap-break-word">
                  {previous.name}
                </span>
              </span>
            </Link>
          )}
          {next && (
            <Link
              href={next.url}
              rel="next"
              className={`${linkClassName} flex-row-reverse text-end sm:col-start-2`}
            >
              <ChevronRight
                aria-hidden="true"
                className="size-4 shrink-0 text-fd-muted-foreground rtl:rotate-180"
              />
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="text-sm leading-5 text-fd-muted-foreground">
                  Next
                </span>
                <span className="text-base leading-6 font-medium wrap-break-word">
                  {next.name}
                </span>
              </span>
            </Link>
          )}
        </nav>
      )}
      {children}
    </div>
  );
}
