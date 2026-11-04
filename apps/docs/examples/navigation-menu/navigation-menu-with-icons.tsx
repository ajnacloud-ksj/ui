"use client";

import { NavigationMenu } from "@ajnacloud/ui";
import { BookOpen, Code2, LifeBuoy } from "lucide-react";

export function NavigationMenuWithIcons() {
  return (
    <NavigationMenu aria-label="Resources">
      <NavigationMenu.List>
        <NavigationMenu.Item value="resources">
          <NavigationMenu.Trigger>Resources</NavigationMenu.Trigger>
          <NavigationMenu.Content>
            <ul className="m-0 w-64 list-none space-y-1 p-0">
              <li>
                <NavigationMenu.Link
                  href="/docs"
                  className="flex-row items-center gap-3"
                >
                  <BookOpen aria-hidden="true" className="size-5 shrink-0" />
                  <span>
                    <span className="block font-medium">Guides</span>
                    <span className="text-[hsl(var(--ajna-muted-foreground))]">
                      Practical examples and patterns.
                    </span>
                  </span>
                </NavigationMenu.Link>
              </li>
              <li>
                <NavigationMenu.Link
                  href="/docs/primitives"
                  className="flex-row items-center gap-3"
                >
                  <Code2 aria-hidden="true" className="size-5 shrink-0" />
                  Primitives and utilities
                </NavigationMenu.Link>
              </li>
              <li>
                <NavigationMenu.Link
                  href="mailto:support@example.com"
                  className="flex-row items-center gap-3"
                >
                  <LifeBuoy aria-hidden="true" className="size-5 shrink-0" />
                  Contact support
                </NavigationMenu.Link>
              </li>
            </ul>
          </NavigationMenu.Content>
        </NavigationMenu.Item>
      </NavigationMenu.List>
    </NavigationMenu>
  );
}
