"use client";

import { NavigationMenu } from "@ajnacloud/ui";
import { useState } from "react";

export function NavigationMenuControlled() {
  const [value, setValue] = useState<string | null>(null);
  return (
    <div className="space-y-3">
      <NavigationMenu
        aria-label="Account"
        value={value}
        onValueChange={setValue}
        align="center"
        positionerProps={{ sideOffset: 12 }}
      >
        <NavigationMenu.List>
          <NavigationMenu.Item value="settings">
            <NavigationMenu.Trigger>Settings</NavigationMenu.Trigger>
            <NavigationMenu.Content>
              <ul className="m-0 w-52 list-none p-0">
                <li>
                  <NavigationMenu.Link href="#profile" active>
                    Profile
                  </NavigationMenu.Link>
                </li>
                <li>
                  <NavigationMenu.Link href="#security">
                    Security
                  </NavigationMenu.Link>
                </li>
              </ul>
            </NavigationMenu.Content>
          </NavigationMenu.Item>
        </NavigationMenu.List>
      </NavigationMenu>
      <p
        role="status"
        className="text-sm text-[hsl(var(--ajna-muted-foreground))]"
      >
        Open panel: {value ?? "none"}
      </p>
    </div>
  );
}
