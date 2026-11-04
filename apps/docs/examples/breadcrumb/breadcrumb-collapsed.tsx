"use client";

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  DropdownMenu,
} from "@ajnacloud/ui";

export function BreadcrumbCollapsed() {
  return (
    <Breadcrumb aria-label="Documentation location">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/docs">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger
              render={
                <Button
                  size="sm"
                  shape="square"
                  variant="ghost"
                  aria-label="Show hidden path"
                />
              }
            >
              <BreadcrumbEllipsis />
            </DropdownMenu.Trigger>
            <DropdownMenu.Content align="start">
              <DropdownMenu.LinkItem href="/docs/installation">
                Getting started
              </DropdownMenu.LinkItem>
              <DropdownMenu.LinkItem href="/docs/components/button">
                Components
              </DropdownMenu.LinkItem>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Breadcrumbs</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
