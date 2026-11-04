"use client";

import { Menubar } from "@ajnacloud/ui";
import { useState } from "react";

export function MenubarSelections() {
  const [toolbar, setToolbar] = useState(true);
  const [statusBar, setStatusBar] = useState(false);
  const [density, setDensity] = useState("comfortable");
  return (
    <div className="space-y-3">
      <Menubar aria-label="Display preferences">
        <Menubar.Menu>
          <Menubar.Trigger>View</Menubar.Trigger>
          <Menubar.Content>
            <Menubar.Group>
              <Menubar.Label>Panels</Menubar.Label>
              <Menubar.CheckboxItem
                checked={toolbar}
                onCheckedChange={setToolbar}
                closeOnClick={false}
              >
                Toolbar
              </Menubar.CheckboxItem>
              <Menubar.CheckboxItem
                checked={statusBar}
                onCheckedChange={setStatusBar}
                closeOnClick={false}
              >
                Status bar
              </Menubar.CheckboxItem>
            </Menubar.Group>
            <Menubar.Separator />
            <Menubar.Group>
              <Menubar.Label>Density</Menubar.Label>
              <Menubar.RadioGroup value={density} onValueChange={setDensity}>
                <Menubar.RadioItem value="comfortable">
                  Comfortable
                </Menubar.RadioItem>
                <Menubar.RadioItem value="compact">Compact</Menubar.RadioItem>
              </Menubar.RadioGroup>
            </Menubar.Group>
          </Menubar.Content>
        </Menubar.Menu>
      </Menubar>
      <p className="text-sm text-[hsl(var(--ajna-muted-foreground))]">
        {density} · Toolbar {toolbar ? "shown" : "hidden"} · Status bar{" "}
        {statusBar ? "shown" : "hidden"}
      </p>
    </div>
  );
}
