"use client";

import { useRender } from "@base-ui/react/use-render";
import { ChevronRight, MoreHorizontal } from "lucide-react";
import { type ComponentPropsWithoutRef, forwardRef } from "react";

import { cn } from "@/utils";

export type BreadcrumbProps = ComponentPropsWithoutRef<"nav">;
export type BreadcrumbListProps = ComponentPropsWithoutRef<"ol">;
export type BreadcrumbItemProps = ComponentPropsWithoutRef<"li">;
export type BreadcrumbLinkProps = Omit<
  useRender.ComponentProps<"a", { slot: string }>,
  "ref"
>;
export type BreadcrumbPageProps = ComponentPropsWithoutRef<"span">;
export type BreadcrumbSeparatorProps = ComponentPropsWithoutRef<"li">;
export type BreadcrumbEllipsisProps = ComponentPropsWithoutRef<"span">;

export const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(
  function Breadcrumb(
    { className, "aria-label": label = "Breadcrumb", ...props },
    ref,
  ) {
    return (
      <nav
        {...props}
        ref={ref}
        aria-label={label}
        data-ajna-component="breadcrumb"
        data-slot="breadcrumb"
        className={cn(
          "box-border font-ajna text-sm leading-5 text-ajna-muted-foreground",
          className,
        )}
      />
    );
  },
);
Breadcrumb.displayName = "Breadcrumb";

export const BreadcrumbList = forwardRef<HTMLOListElement, BreadcrumbListProps>(
  function BreadcrumbList({ className, ...props }, ref) {
    return (
      <ol
        {...props}
        ref={ref}
        data-ajna-component="breadcrumb-list"
        data-slot="breadcrumb-list"
        className={cn(
          "m-0 box-border flex list-none flex-wrap items-center gap-1.5 break-words p-0",
          className,
        )}
      />
    );
  },
);
BreadcrumbList.displayName = "BreadcrumbList";

export const BreadcrumbItem = forwardRef<HTMLLIElement, BreadcrumbItemProps>(
  function BreadcrumbItem({ className, ...props }, ref) {
    return (
      <li
        {...props}
        ref={ref}
        data-ajna-component="breadcrumb-item"
        data-slot="breadcrumb-item"
        className={cn(
          "m-0 box-border inline-flex min-w-0 items-center gap-1.5 p-0",
          className,
        )}
      />
    );
  },
);
BreadcrumbItem.displayName = "BreadcrumbItem";

export const BreadcrumbLink = forwardRef<HTMLElement, BreadcrumbLinkProps>(
  function BreadcrumbLink({ className, render, ...props }, ref) {
    return useRender({
      defaultTagName: "a",
      ref,
      render,
      state: { slot: "breadcrumb-link" },
      props: {
        ...props,
        "data-ajna-component": "breadcrumb-link",
        className: cn(
          "box-border rounded-ajna-sm text-inherit no-underline outline-none transition-colors hover:text-ajna-foreground focus-visible:ring-2 focus-visible:ring-ajna-ring focus-visible:ring-offset-2 focus-visible:ring-offset-ajna-background motion-reduce:transition-none",
          className,
        ),
      },
    });
  },
);
BreadcrumbLink.displayName = "BreadcrumbLink";

export const BreadcrumbPage = forwardRef<HTMLSpanElement, BreadcrumbPageProps>(
  function BreadcrumbPage({ className, ...props }, ref) {
    return (
      <span
        {...props}
        ref={ref}
        aria-current="page"
        data-ajna-component="breadcrumb-page"
        data-slot="breadcrumb-page"
        className={cn("box-border font-normal text-ajna-foreground", className)}
      />
    );
  },
);
BreadcrumbPage.displayName = "BreadcrumbPage";

export const BreadcrumbSeparator = forwardRef<
  HTMLLIElement,
  BreadcrumbSeparatorProps
>(function BreadcrumbSeparator({ children, className, ...props }, ref) {
  return (
    <li
      {...props}
      ref={ref}
      role="presentation"
      aria-hidden="true"
      data-ajna-component="breadcrumb-separator"
      data-slot="breadcrumb-separator"
      className={cn(
        "m-0 box-border flex shrink-0 items-center p-0 [&>svg]:h-3.5 [&>svg]:w-3.5",
        className,
      )}
    >
      {children ?? (
        <ChevronRight aria-hidden="true" className="rtl:rotate-180" />
      )}
    </li>
  );
});
BreadcrumbSeparator.displayName = "BreadcrumbSeparator";

export const BreadcrumbEllipsis = forwardRef<
  HTMLSpanElement,
  BreadcrumbEllipsisProps
>(function BreadcrumbEllipsis({ className, children, ...props }, ref) {
  return (
    <span
      {...props}
      ref={ref}
      aria-hidden="true"
      data-ajna-component="breadcrumb-ellipsis"
      data-slot="breadcrumb-ellipsis"
      className={cn(
        "box-border inline-flex h-5 w-5 items-center justify-center [&>svg]:h-4 [&>svg]:w-4",
        className,
      )}
    >
      {children ?? <MoreHorizontal aria-hidden="true" />}
    </span>
  );
});
BreadcrumbEllipsis.displayName = "BreadcrumbEllipsis";
