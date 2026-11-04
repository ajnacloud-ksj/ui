"use client";

import { NavigationMenu, navigationMenuTriggerStyle } from "@ajnacloud/ui";

export function NavigationMenuBasic() {
  return (
    <NavigationMenu aria-label="Main navigation">
      <NavigationMenu.List>
        <NavigationMenu.Item value="getting-started">
          <NavigationMenu.Trigger>Getting started</NavigationMenu.Trigger>
          <NavigationMenu.Content>
            <ul className="m-0 grid w-[min(28rem,calc(100vw-3rem))] list-none gap-1 p-0 sm:grid-cols-2">
              <li>
                <NavigationMenu.Link href="/docs">
                  <span className="font-medium">Introduction</span>
                  <span className="text-[hsl(var(--ajna-muted-foreground))]">
                    Build interfaces with Ajna components.
                  </span>
                </NavigationMenu.Link>
              </li>
              <li>
                <NavigationMenu.Link href="/docs/installation">
                  <span className="font-medium">Installation</span>
                  <span className="text-[hsl(var(--ajna-muted-foreground))]">
                    Set up your package and styles.
                  </span>
                </NavigationMenu.Link>
              </li>
              <li>
                <NavigationMenu.Link href="/docs/theming">
                  <span className="font-medium">Theming</span>
                  <span className="text-[hsl(var(--ajna-muted-foreground))]">
                    Use your application's colors.
                  </span>
                </NavigationMenu.Link>
              </li>
            </ul>
          </NavigationMenu.Content>
        </NavigationMenu.Item>
        <NavigationMenu.Item value="components">
          <NavigationMenu.Trigger>Components</NavigationMenu.Trigger>
          <NavigationMenu.Content>
            <ul className="m-0 w-56 list-none space-y-1 p-0">
              <li>
                <NavigationMenu.Link href="/docs/components/button">
                  Button
                </NavigationMenu.Link>
              </li>
              <li>
                <NavigationMenu.Link href="/docs/components/dialog">
                  Dialog
                </NavigationMenu.Link>
              </li>
              <li>
                <NavigationMenu.Link href="/docs/components/field">
                  Field
                </NavigationMenu.Link>
              </li>
            </ul>
          </NavigationMenu.Content>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link
            href="/docs"
            className={navigationMenuTriggerStyle()}
          >
            Docs
          </NavigationMenu.Link>
        </NavigationMenu.Item>
      </NavigationMenu.List>
    </NavigationMenu>
  );
}
