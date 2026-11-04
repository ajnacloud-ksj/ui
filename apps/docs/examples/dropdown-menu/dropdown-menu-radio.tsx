"use client";

import { Button, DropdownMenu } from "@ajnacloud/ui";
import { useId, useState } from "react";

export function DropdownMenuRadio() {
  const [density, setDensity] = useState("comfortable");
  const labelId = useId();
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger render={<Button variant="outline" />}>
          Row density
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Group>
            <DropdownMenu.Label id={labelId} inset>
              Row density
            </DropdownMenu.Label>
            <DropdownMenu.RadioGroup
              value={density}
              onValueChange={setDensity}
              aria-labelledby={labelId}
            >
              <DropdownMenu.RadioItem value="comfortable">
                Comfortable
              </DropdownMenu.RadioItem>
              <DropdownMenu.RadioItem value="compact">
                Compact
              </DropdownMenu.RadioItem>
            </DropdownMenu.RadioGroup>
          </DropdownMenu.Group>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
      <p role="status" style={{ margin: 0 }}>
        Selected: {density}
      </p>
    </div>
  );
}
